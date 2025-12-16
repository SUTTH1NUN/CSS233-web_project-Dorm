// backend/controllers/dashboardController.js
const pool = require("../config/db");

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Prepare SQL Queries
        const revenueSql = `
            SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
            FROM payments
            WHERE payment_status = 'paid'
            AND EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        `;

        const occupancySql = `
            SELECT 
                COUNT(*) AS total_rooms,
                SUM(CASE WHEN room_status = 'occupied' THEN 1 ELSE 0 END) AS occupied_rooms
            FROM rooms
        `;

        const repairSql = `
            SELECT COUNT(*) AS active_count
            FROM repairs
            WHERE repair_status IN ('pending', 'in_progress')
        `;

        const roomListSql = `
            SELECT room_number, room_type, floor, room_status
            FROM rooms
            ORDER BY room_number ASC
            LIMIT 5
        `;

        const transactionSql = `
            SELECT 
                p.payment_id,
                p.total_amount,
                p.payment_status,
                p.payment_date,
                p.billing_date,
                r.room_number
            FROM payments p
            JOIN lease_contract lc ON p.contract_id = lc.contract_id
            JOIN rooms r ON lc.room_id = r.room_id
            ORDER BY p.payment_id DESC
            LIMIT 5
        `;

        // 2. Execute all queries in parallel
        const [revenueRes, occupancyRes, repairsRes, roomsRes, paymentsRes] = await Promise.all([
            pool.query(revenueSql),
            pool.query(occupancySql),
            pool.query(repairSql),
            pool.query(roomListSql),
            pool.query(transactionSql)
        ]);

        // 3. Process Data
        const totalRevenue = parseFloat(revenueRes.rows[0].total_revenue);
        
        const totalRooms = parseInt(occupancyRes.rows[0].total_rooms) || 0;
        const occupiedRooms = parseInt(occupancyRes.rows[0].occupied_rooms) || 0;
        const availableRooms = totalRooms - occupiedRooms;
        
        // คำนวณ % Occupancy (ป้องกัน Error หารด้วย 0)
        const occupancyRate = totalRooms > 0 
            ? Math.round((occupiedRooms / totalRooms) * 100) 
            : 0;

        const activeRepairs = parseInt(repairsRes.rows[0].active_count) || 0;

        // 4. Response
        res.json({
            revenue: totalRevenue,
            occupancy: {
                rate: occupancyRate,
                occupied: occupiedRooms,
                total: totalRooms,
                available: availableRooms
            },
            active_repairs: activeRepairs,
            rooms_list: roomsRes.rows,
            payments_list: paymentsRes.rows
        });

    } catch (err) {
        console.error("Dashboard Stats Error:", err.message);
        // เปลี่ยนจาก .send() เป็น .json() เพื่อให้ Frontend รับค่าเหมือนกันทุก API
        res.status(500).json({ message: "Server Error" });
    }
};