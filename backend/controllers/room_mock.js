const sql = `
    select building, floor, room_number, room_type,room_status
    from rooms`

const addRoomQuery = `
    INSERT INTO rooms (building, floor, room_number, room_type, room_status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
`;

const editRoomQuery = `
    UPDATE rooms
    SET 
        building = $1,
        floor = $2,
        room_number = $3,
        room_type = $4,
        room_status = $5
    WHERE room_number = $6
    RETURNING *;
`;