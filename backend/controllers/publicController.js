// controllers/publicController.js
const pool = require("../config/db");

exports.getAvailableRooms = async (req, res) => {
    try {
        // Query ดึงเฉพาะห้องที่สถานะ 'available'
        const query = `
            SELECT room_number, room_type 
            FROM rooms 
            WHERE room_status = 'available'
            ORDER BY room_number ASC
        `;
        
        const result = await pool.query(query);

        // จัดกลุ่มข้อมูลตาม room_type เพื่อให้ Frontend ใช้ง่าย
        // ผลลัพธ์จะเป็น: { "Studio": ["A-101", "A-102"], "1 Bedroom": ["B-201"] }
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
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};