const pool = require("../config/db");

// 1. ดึงข้อมูลห้องทั้งหมด (รวมราคาและขนาดจาก room_info)
exports.getAllRooms = async (req, res) => {
    try {
        const sql = `
            SELECT 
                r.room_id,
                r.building,
                r.floor,
                r.room_number,
                r.room_status,
                r.room_type,
                ri.room_price,
                ri.room_size,
                ri.room_furniture
            FROM rooms r
            JOIN room_info ri ON r.room_type = ri.room_type
            ORDER BY r.building, r.room_number
        `;
        
        const result = await pool.query(sql);
        res.json(result.rows);

    } catch (err) {
        console.error("Get All Rooms Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. ดึงประเภทห้องทั้งหมด (สำหรับ Dropdown ตอนสร้างห้อง)
exports.getRoomTypes = async (req, res) => {
    try {
        const sql = `SELECT * FROM room_info`;
        const result = await pool.query(sql);
        
        res.json(result.rows);

    } catch (err) {
        console.error("Get Room Types Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. สร้างห้องใหม่ (Create Room)
exports.createRoom = async (req, res) => {
    try {
        const { room_number, building, floor, room_type, room_status } = req.body;

        const sql = `
            INSERT INTO rooms (room_number, building, floor, room_type, room_status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const values = [room_number, building, floor, room_type, room_status];
        const result = await pool.query(sql, values);
        
        res.status(201).json({ 
            message: "Room added successfully", 
            room: result.rows[0] 
        });

    } catch (err) {
        console.error("Create Room Error:", err.message);
        // ส่ง Error กลับไปเผื่อกรณี room_number ซ้ำ (Unique constraint)
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};

// 4. แก้ไขข้อมูลห้อง (Update Room)
exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { room_number, building, floor, room_type, room_status } = req.body;

        const sql = `
            UPDATE rooms 
            SET room_number = $1, 
                building = $2, 
                floor = $3, 
                room_type = $4, 
                room_status = $5
            WHERE room_id = $6
            RETURNING *
        `;
        
        const values = [room_number, building, floor, room_type, room_status, id];
        const result = await pool.query(sql, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.json({ message: "Room updated successfully", room: result.rows[0] });

    } catch (err) {
        console.error("Update Room Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};