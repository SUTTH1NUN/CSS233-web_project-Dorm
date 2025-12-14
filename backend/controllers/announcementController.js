const pool = require("../config/db");

// Helper: แปลงค่าว่างให้เป็น NULL สำหรับ Database
const cleanDate = (date) => {
    if (!date || date === "" || date === "null") return null;
    return date;
};

// 1. สร้างประกาศ (Create)
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, visible_until, announcements_status } = req.body;
        const admin_id = req.user.id; // ดึงจาก Token

        if (!title || !content) return res.status(400).json({ message: "กรุณาระบุหัวข้อและเนื้อหา" });

        const sql = `
            INSERT INTO announcements (admin_id, title, content, visible_until, announcements_status)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        
        await pool.query(sql, [admin_id, title, content, cleanDate(visible_until), announcements_status || 'active']);
        res.status(201).json({ message: "สร้างประกาศสำเร็จ" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. ดึงทั้งหมด (Read All)
exports.getAllAnnouncements = async (req, res) => {
    try {
        const sql = `
            SELECT a.*, ad.username as admin_name 
            FROM announcements a
            JOIN admins ad ON a.admin_id = ad.admin_id
            WHERE a.announcements_status = 'active'
            ORDER BY a.created_at DESC`;
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getAllAnnouncementsForAdmin = async (req, res) => {
    try {
        const sql = `
            SELECT a.*, ad.username as admin_name 
            FROM announcements a
            JOIN admins ad ON a.admin_id = ad.admin_id
            ORDER BY a.created_at DESC`;
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
// 3. ดึงรายอัน (Read One) - สำหรับกด View/Edit
exports.getAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM announcements WHERE announcement_id = $1', [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: "ไม่พบประกาศ" });
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. แก้ไข (Update)
exports.updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, visible_until, announcements_status } = req.body;

        const sql = `
            UPDATE announcements 
            SET title=$1, content=$2, visible_until=$3, announcements_status=$4
            WHERE announcement_id=$5`;
        
        await pool.query(sql, [title, content, cleanDate(visible_until), announcements_status, id]);
        res.json({ message: "แก้ไขข้อมูลสำเร็จ" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// 5. ลบ (Delete)
exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM announcements WHERE announcement_id = $1', [id]);
        res.json({ message: "ลบประกาศสำเร็จ" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};