// backend/controllers/announcementController.js
const pool = require("../config/db");

// Helper: แปลงค่าว่างหรือ string "null" ให้เป็น NULL ของ Database
// จำเป็นต้องทำเพราะบางครั้ง Client ส่งค่าว่างมาเป็น String ทำให้บันทึกวันที่ผิดพลาด
const cleanDate = (date) => {
    return (!date || date === "" || date === "null") ? null : date;
};

exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, visible_until, announcements_status } = req.body;
        const adminId = req.user.id; 

        if (!title || !content) {
            return res.status(400).json({ message: "กรุณาระบุหัวข้อและเนื้อหา" });
        }

        const sql = `
            INSERT INTO announcements (admin_id, title, content, visible_until, announcements_status)
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `;

        // กำหนดค่า Default status เป็น 'active' หากไม่ได้ส่งมา
        const values = [adminId, title, content, cleanDate(visible_until), announcements_status || 'active'];
        
        await pool.query(sql, values);
        res.status(201).json({ message: "สร้างประกาศสำเร็จ" });

    } catch (err) {
        console.error("Create Announcement Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getAllAnnouncements = async (req, res) => {
    try {
        // ดึงเฉพาะประกาศที่ active สำหรับ User ทั่วไป
        const sql = `
            SELECT a.*, ad.username AS admin_name 
            FROM announcements a
            JOIN admins ad ON a.admin_id = ad.admin_id
            WHERE a.announcements_status = 'active'
            ORDER BY a.created_at DESC
        `;
        
        const result = await pool.query(sql);
        res.json(result.rows);

    } catch (err) {
        console.error("Get All Announcements Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getAllAnnouncementsForAdmin = async (req, res) => {
    try {
        // ดึงทุกประกาศ (รวมที่ปิดไปแล้ว) สำหรับ Admin
        const sql = `
            SELECT a.*, ad.username AS admin_name 
            FROM announcements a
            JOIN admins ad ON a.admin_id = ad.admin_id
            ORDER BY a.created_at DESC
        `;
        
        const result = await pool.query(sql);
        res.json(result.rows);

    } catch (err) {
        console.error("Get Admin Announcements Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const sql = `SELECT * FROM announcements WHERE announcement_id = $1`;
        const result = await pool.query(sql, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบประกาศ" });
        }
        
        res.json(result.rows[0]);

    } catch (err) {
        console.error("Get Announcement By ID Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, visible_until, announcements_status } = req.body;

        const sql = `
            UPDATE announcements 
            SET title = $1, 
                content = $2, 
                visible_until = $3, 
                announcements_status = $4
            WHERE announcement_id = $5
        `;
        
        const values = [title, content, cleanDate(visible_until), announcements_status, id];
        
        await pool.query(sql, values);
        res.json({ message: "แก้ไขข้อมูลสำเร็จ" });

    } catch (err) {
        console.error("Update Announcement Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        
        const sql = `DELETE FROM announcements WHERE announcement_id = $1`;
        await pool.query(sql, [id]);
        
        res.json({ message: "ลบประกาศสำเร็จ" });

    } catch (err) {
        console.error("Delete Announcement Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};