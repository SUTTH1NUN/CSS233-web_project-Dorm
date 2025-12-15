const pool = require("../config/db");

exports.getAllRooms = async (req, res) => {
  try {
    const query = `
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
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getRoomTypes = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM room_info");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.createRoom = async (req, res) => {
    const { room_number, building, floor, room_type, room_status } = req.body;
    try {
        const query = `
            INSERT INTO rooms (room_number, building, floor, room_type, room_status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await pool.query(query, [room_number, building, floor, room_type, room_status]);
        res.json({ msg: "Room added successfully", room: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error: " + err.message);
    }
};

exports.updateRoom = async (req, res) => {
    const { id } = req.params;
    const { room_number, building, floor, room_type, room_status } = req.body;
    try {
        const query = `
            UPDATE rooms 
            SET room_number = $1, building = $2, floor = $3, room_type = $4, room_status = $5
            WHERE room_id = $6
            RETURNING *
        `;
        const result = await pool.query(query, [room_number, building, floor, room_type, room_status, id]);
        
        if (result.rows.length === 0) return res.status(404).json({ msg: "Room not found" });

        res.json({ msg: "Room updated successfully", room: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};