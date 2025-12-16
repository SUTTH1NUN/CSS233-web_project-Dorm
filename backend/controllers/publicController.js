// backend/controllers/publicController.js
const pool = require("../config/db");

exports.getAvailableRooms = async (req, res) => {
    try {
        const sql = `
            SELECT room_number, room_type 
            FROM rooms 
            WHERE room_status = 'available'
            ORDER BY room_number ASC
        `;
        
        const result = await pool.query(sql);

        // จัดกลุ่มข้อมูลตาม room_type เพื่อให้ Frontend นำไปวนลูปแสดงผลได้ง่าย
        // Output Format: { "Standard": ["101", "102"], "Deluxe": ["201"] }
        const groupedRooms = result.rows.reduce((acc, room) => {
            const type = room.room_type;
            
            if (!acc[type]) {
                acc[type] = [];
            }
            
            acc[type].push(room.room_number);
            return acc;
        }, {});

        res.json(groupedRooms);

    } catch (err) {
        console.error("Get Available Rooms Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};