const pool = require("../config/db");

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue (เดือนนี้)
        // นับรวมยอด total_amount จากตาราง payments เฉพาะสถานะ 'paid' ในเดือนนี้
        const revenueQuery = `
            SELECT SUM(total_amount) as total 
            FROM payments 
            WHERE payment_status = 'paid'
            AND date_part('month', payment_date) = date_part('month', CURRENT_DATE)
            AND date_part('year', payment_date) = date_part('year', CURRENT_DATE)
        `;

        // 2. Room Stats (Available, Occupied, etc.)
        const roomStatsQuery = `
            SELECT 
                COUNT(*) FILTER (WHERE room_status = 'occupied') as occupied,
                COUNT(*) FILTER (WHERE room_status = 'available') as available,
                COUNT(*) as total
            FROM rooms
        `;

        // 3. Active Repairs (Pending + In Progress)
        const repairStatsQuery = `
            SELECT COUNT(*) as active_count 
            FROM repairs 
            WHERE repair_status IN ('pending', 'in_progress')
        `;

        // 4. Room List (Overview)
        const recentRoomsQuery = `
            SELECT room_number, room_type, floor, room_status 
            FROM rooms 
            ORDER BY building, room_number 
            LIMIT 5
        `;

        // 5. Recent Payments (List)
        // **สำคัญ:** Join payments -> lease_contract -> rooms เพื่อเอาเลขห้อง
        const recentPaymentsQuery = `
            SELECT 
                p.total_amount, 
                p.payment_status, 
                p.payment_date, 
                r.room_number 
            FROM payments p
            JOIN lease_contract lc ON p.contract_id = lc.contract_id
            JOIN rooms r ON lc.room_id = r.room_id
            ORDER BY p.payment_date DESC 
            LIMIT 4
        `;

        // รัน Query ทั้งหมดพร้อมกัน
        const [revenueRes, roomRes, repairRes, roomsListRes, paymentListRes] = await Promise.all([
            pool.query(revenueQuery),
            pool.query(roomStatsQuery),
            pool.query(repairStatsQuery),
            pool.query(recentRoomsQuery),
            pool.query(recentPaymentsQuery)
        ]);

        // คำนวณ % Occupancy
        const totalRooms = parseInt(roomRes.rows[0].total) || 1;
        const occupiedRooms = parseInt(roomRes.rows[0].occupied) || 0;
        const occupancyRate = ((occupiedRooms / totalRooms) * 100).toFixed(1);

        // ส่งข้อมูลกลับไป Frontend
        res.json({
            revenue: revenueRes.rows[0].total || 0,
            occupancy: {
                rate: occupancyRate,
                occupied: occupiedRooms,
                total: totalRooms,
                available: roomRes.rows[0].available
            },
            active_repairs: repairRes.rows[0].active_count,
            rooms_list: roomsListRes.rows,
            payments_list: paymentListRes.rows
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};