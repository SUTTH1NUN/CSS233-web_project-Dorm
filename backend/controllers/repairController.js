const pool = require("../config/db");

// 1. ดึงรายการแจ้งซ่อมทั้งหมด (สำหรับ Admin)
exports.getAllRepairs = async (req, res) => {
    try {
        // Logic: เรียงสถานะ 'pending' ขึ้นก่อน (1), สถานะอื่นเอาไว้ทีหลัง (2) 
        // แล้วค่อยเรียงตามวันที่ล่าสุด
        const sql = `
            SELECT 
                r.repair_id,
                r.issue_title,
                r.issue_description,
                r.repair_status,
                r.request_date,
                r.admin_note,
                rm.room_number,
                t.phone_number,
                t.first_name,
                t.last_name
            FROM repairs r
            JOIN rooms rm ON r.room_id = rm.room_id
            JOIN tenants t ON r.tenant_id = t.tenant_id
            ORDER BY 
                CASE WHEN r.repair_status = 'pending' THEN 1 ELSE 2 END, 
                r.request_date DESC
        `;

        const result = await pool.query(sql);
        res.json(result.rows);

    } catch (err) {
        console.error("Get All Repairs Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. อัปเดตสถานะและ Admin Note
exports.updateRepairStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { repair_status, admin_note } = req.body;

        // Logic: ถ้าสถานะเป็น 'completed' ให้บันทึกวันที่ปัจจุบันลง resolved_date ด้วย
        const sql = `
            UPDATE repairs 
            SET repair_status = $1, 
                admin_note = $2,
                resolved_date = CASE 
                    WHEN $1::repair_status_enum = 'completed' THEN CURRENT_DATE 
                    ELSE NULL 
                END
            WHERE repair_id = $3
            RETURNING *
        `;

        const result = await pool.query(sql, [repair_status, admin_note, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Repair request not found" });
        }

        res.json({ message: "Repair updated successfully", repair: result.rows[0] });

    } catch (err) {
        console.error("Update Repair Status Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. สร้างใบแจ้งซ่อม (สำหรับ Tenant)
exports.createRepair = async (req, res) => {
    try {
        const tenantId = req.user.id;
        // รับค่า issue_category มาใส่ในช่อง issue_title ตาม Logic เดิม
        const { issue_category, issue_description, phone_number } = req.body;
        const imgPath = req.file ? `/uploads/${req.file.filename}` : null;

        // Step 1: หา Room ID จากสัญญาเช่าปัจจุบัน (Active Contract)
        const contractSql = `
            SELECT room_id 
            FROM lease_contract 
            WHERE tenant_id = $1 AND contract_status = 'active'
            LIMIT 1
        `;
        const contractRes = await pool.query(contractSql, [tenantId]);
        
        if (contractRes.rows.length === 0) {
            return res.status(404).json({ message: "No active lease contract found for this tenant." });
        }
        
        const roomId = contractRes.rows[0].room_id;

        // Step 2: บันทึกการแจ้งซ่อม
        const insertSql = `
            INSERT INTO repairs (
                tenant_id, room_id, issue_title, issue_description, 
                phone_number, img_path, repair_status
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'pending')
            RETURNING *
        `;
        
        const values = [tenantId, roomId, issue_category, issue_description, phone_number, imgPath];
        const newRepair = await pool.query(insertSql, values);

        res.status(201).json({ 
            message: "Repair request submitted", 
            repair: newRepair.rows[0] 
        });

    } catch (err) {
        console.error("Create Repair Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. ดูประวัติการแจ้งซ่อมของตัวเอง (สำหรับ Tenant)
exports.getMyRepairs = async (req, res) => {
    try {
        const tenantId = req.user.id;

        const sql = `
            SELECT * FROM repairs 
            WHERE tenant_id = $1
            ORDER BY request_date DESC, repair_id DESC
        `;
        
        const result = await pool.query(sql, [tenantId]);
        res.json(result.rows);

    } catch (err) {
        console.error("Get My Repairs Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// 5. ดึงเลขห้องมาแสดงหน้าฟอร์ม (Helper)
exports.getMyRoomInfo = async (req, res) => {
    try {
        const tenantId = req.user.id;
        
        const sql = `
            SELECT r.room_number 
            FROM lease_contract lc
            JOIN rooms r ON lc.room_id = r.room_id
            WHERE lc.tenant_id = $1 AND lc.contract_status = 'active'
            LIMIT 1
        `;
        
        const result = await pool.query(sql, [tenantId]);
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            // กรณีไม่มีห้อง ให้ส่ง JSON กลับไปดีกว่าส่ง plain text เพื่อให้ Frontend parse ง่าย
            res.json({ room_number: "Not Assigned" });
        }

    } catch (err) {
        console.error("Get My Room Info Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};