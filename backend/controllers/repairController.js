const pool = require("../config/db");

// 1. ดึงรายการแจ้งซ่อมทั้งหมด (สำหรับ Admin)
exports.getAllRepairs = async (req, res) => {
  try {
    const query = `
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
    // *Logic เรียงลำดับ: เอา Pending ขึ้นก่อน, ตามด้วยวันที่ล่าสุด

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// 2. อัปเดตสถานะและ Admin Note
exports.updateRepairStatus = async (req, res) => {
  const { id } = req.params; // รับ repair_id จาก URL
  const { repair_status, admin_note } = req.body; // รับข้อมูลที่ส่งมาจากหน้าบ้าน

    try {
    const query = `
      UPDATE repairs 
        SET repair_status = $1, 
            admin_note = $2,
            resolved_date = CASE WHEN $1::repair_status_enum  = 'completed' THEN CURRENT_DATE ELSE NULL END
        WHERE repair_id = $3
        RETURNING *
    `;

    const result = await pool.query(query, [repair_status, admin_note, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Repair request not found" });
    }

    res.json({ msg: "Repair updated successfully", repair: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.createRepair = async (req, res) => {
    const tenant_id = req.user.id;
    const { issue_category, issue_description, phone_number } = req.body;
    const img_path = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        // หา Room ID จาก Lease Contract ที่ Active อยู่
        const contractQuery = `
            SELECT room_id 
            FROM lease_contract 
            WHERE tenant_id = $1 AND contract_status = 'active'
            LIMIT 1
        `;
        const contractRes = await pool.query(contractQuery, [tenant_id]);
        
        if (contractRes.rows.length === 0) {
            return res.status(404).json({ msg: "No active lease contract found for this tenant." });
        }
        
        const room_id = contractRes.rows[0].room_id;

        const insertQuery = `
            INSERT INTO repairs 
            (tenant_id, room_id, issue_title, issue_description, phone_number, img_path, repair_status)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending')
            RETURNING *
        `;
        
        const newRepair = await pool.query(insertQuery, [
            tenant_id, 
            room_id, 
            issue_category, 
            issue_description, 
            phone_number, 
            img_path
        ]);

        res.json({ msg: "Repair request submitted", repair: newRepair.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.getMyRepairs = async (req, res) => {
    const tenant_id = req.user.id;

    try {
        const query = `
            SELECT * FROM repairs 
            WHERE tenant_id = $1
            ORDER BY request_date DESC, repair_id DESC
        `;
        const result = await pool.query(query, [tenant_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// เพิ่มฟังก์ชันสำหรับดึงเลขห้องไปแสดงหน้าเว็บ
exports.getMyRoomInfo = async (req, res) => {
    const tenant_id = req.user.id;
    try {
        const query = `
            SELECT r.room_number 
            FROM lease_contract lc
            JOIN rooms r ON lc.room_id = r.room_id
            WHERE lc.tenant_id = $1 AND lc.contract_status = 'active'
            LIMIT 1
        `;
        const result = await pool.query(query, [tenant_id]);
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.json({ room_number: "Not Assigned" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};