// controllers/repairController.js
const pool = require("../config/db");

// --- 1. ผู้เช่าแจ้งซ่อม (Tenant Create) ---
exports.createRepair = async (req, res) => {
    try {
        // ดึง tenant_id จาก Token (ที่ผ่าน Middleware มาแล้ว)
        const tenant_id = req.user.id; 
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ message: "กรุณาระบุหัวข้อการแจ้งซ่อม" });
        }

        // 1. หา room_id ที่ผู้เช่าคนนี้อยู่ (จากสัญญาเช่าล่าสุด)
        const roomSql = `SELECT room_id FROM lease_contract WHERE tenant_id = $1 ORDER BY start_date DESC LIMIT 1`;
        const roomRes = await pool.query(roomSql, [tenant_id]);

        if (roomRes.rows.length === 0) {
            return res.status(400).json({ message: "ไม่พบข้อมูลห้องพักของคุณ (ยังไม่มีสัญญาเช่า)" });
        }
        const room_id = roomRes.rows[0].room_id;

        // 2. บันทึกข้อมูล
        const insertSql = `
            INSERT INTO repairs (tenant_id, room_id, title, description)
            VALUES ($1, $2, $3, $4) 
            RETURNING *
        `;
        const result = await pool.query(insertSql, [tenant_id, room_id, title, description]);

        res.status(201).json({ message: "แจ้งซ่อมสำเร็จ", repair: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 2. แอดมินดูรายการทั้งหมด (Admin Read All) ---
exports.getAllRepairs = async (req, res) => {
    try {
        const { search, status } = req.query; // รองรับ Search/Filter จาก URL (เผื่ออนาคต)

        // JOIN 3 ตาราง: Repairs + Tenants (เอาชื่อ) + Rooms (เอาเลขห้อง)
        let sql = `
            SELECT 
                r.repair_id, r.title, r.description, r.status, r.created_at, r.admin_comment,
                t.first_name, t.last_name, t.phone_number,
                rm.building, rm.room_number
            FROM repairs r
            JOIN tenants t ON r.tenant_id = t.tenant_id
            JOIN rooms rm ON r.room_id = rm.room_id
            WHERE 1=1
        `;
        
        const params = [];

        // ถ้ามีการส่ง ?status=pending มา
        if (status && status !== 'all') {
            params.push(status);
            sql += ` AND r.status = $${params.length}`;
        }

        sql += ` ORDER BY r.created_at DESC`;

        const result = await pool.query(sql, params);
        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 3. แอดมินอัปเดตสถานะ (Admin Update) ---
exports.updateRepairStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_comment } = req.body;

        const sql = `
            UPDATE repairs 
            SET status = $1, admin_comment = $2, updated_at = CURRENT_TIMESTAMP
            WHERE repair_id = $3
            RETURNING *
        `;
        
        const result = await pool.query(sql, [status, admin_comment, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบรายการนี้" });
        }

        res.json({ message: "อัปเดตสถานะเรียบร้อย", repair: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 4. ลบรายการ (เผื่อใช้) ---
exports.deleteRepair = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM repairs WHERE repair_id = $1", [id]);
        res.json({ message: "ลบรายการสำเร็จ" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};