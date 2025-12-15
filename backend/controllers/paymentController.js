/*
// controllers/paymentController.js
const pool = require("../config/db");

// --- 1. สร้างใบแจ้งหนี้ (Create Invoice) ---
exports.createPayment = async (req, res) => {
    try {
        const { 
            room_number,
            billing_date, due_date,
            room_fee,
            // รับค่ามิเตอร์เก่า-ใหม่
            elec_last, elec_curr, elec_fee,
            water_last, water_curr, water_fee,
            total_amount,
            payment_status
        } = req.body;

        // 1. หา contract_id จากเลขห้อง
        const contractSql = `
            SELECT l.contract_id 
            FROM lease_contract l
            JOIN rooms r ON l.room_id = r.room_id
            WHERE r.room_number = $1 AND r.room_status = 'occupied'
            ORDER BY l.start_date DESC LIMIT 1
        `;
        const contractRes = await pool.query(contractSql, [room_number]);

        if (contractRes.rows.length === 0) {
            return res.status(400).json({ message: "ไม่พบสัญญาเช่าห้องนี้" });
        }
        const contract_id = contractRes.rows[0].contract_id;

        // 2. บันทึก Payment (ตามตารางใหม่ของคุณ)
        const insertSql = `
            INSERT INTO payments (
                contract_id, billing_date, due_date,
                room_fee, 
                electricity_meter_last, electricity_meter_current, electricity_fee,
                water_meter_last, water_meter_current, water_fee,
                total_amount, payment_status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;

        const result = await pool.query(insertSql, [
            contract_id, billing_date, due_date,
            room_fee,
            elec_last, elec_curr, elec_fee,
            water_last, water_curr, water_fee,
            total_amount, payment_status || 'pending'
        ]);

        res.status(201).json({ message: "สร้างบิลสำเร็จ", payment: result.rows[0] });

    } catch (err) {
        console.error("Create Payment Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 2. ดูรายการทั้งหมด ---
exports.getAllPayments = async (req, res) => {
    try {
        const sql = `
            SELECT 
                p.payment_id, p.billing_date, p.due_date, p.total_amount, p.payment_status,
                r.room_number, r.building,
                t.first_name, t.last_name
            FROM payments p
            JOIN lease_contract l ON p.contract_id = l.contract_id
            JOIN rooms r ON l.room_id = r.room_id
            JOIN tenants t ON l.tenant_id = t.tenant_id
            ORDER BY p.billing_date DESC
        `;
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 3. อัปเดตสถานะ (จ่ายเงินแล้ว) ---
exports.updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        // รับค่า status และ payment_date
        const { payment_status, payment_date } = req.body;

        const sql = `
            UPDATE payments 
            SET payment_status = $1, payment_date = $2
            WHERE payment_id = $3
            RETURNING *
        `;
        
        // ถ้าสถานะเป็น 'paid' ให้ใส่วันที่จ่าย ถ้าไม่ใช่ให้เป็น null
        const payDate = (payment_status === 'paid') ? (payment_date || new Date()) : null;

        const result = await pool.query(sql, [payment_status, payDate, id]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: "Not Found" });
        res.json({ message: "Updated", payment: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// controllers/paymentController.js (แก้ไขเฉพาะฟังก์ชันนี้)

exports.getLatestMeter = async (req, res) => {
    try {
        const { room_number } = req.params;

        // SQL ใหม่: ดึงข้อมูลสัญญา (เพื่อเอาค่าห้อง) + ประวัติบิลล่าสุด (เพื่อเอามิเตอร์)
        const sql = `
            SELECT 
                l.rent_price AS room_fee, -- ดึงค่าห้องจากสัญญา
                (
                    SELECT p.electricity_meter_current 
                    FROM payments p 
                    WHERE p.contract_id = l.contract_id 
                    ORDER BY p.billing_date DESC LIMIT 1
                ) AS last_elec,
                (
                    SELECT p.water_meter_current 
                    FROM payments p 
                    WHERE p.contract_id = l.contract_id 
                    ORDER BY p.billing_date DESC LIMIT 1
                ) AS last_water
            FROM lease_contract l
            JOIN rooms r ON l.room_id = r.room_id
            WHERE r.room_number = $1 AND r.room_status = 'occupied'
            ORDER BY l.start_date DESC
            LIMIT 1
        `;

        const result = await pool.query(sql, [room_number]);

        if (result.rows.length > 0) {
            const data = result.rows[0];
            // ส่งกลับ ถ้าไม่มีประวัติมิเตอร์ (บิลแรก) ให้เป็น 0
            res.json({
                room_fee: parseFloat(data.room_fee || 0),
                last_elec: data.last_elec || 0,
                last_water: data.last_water || 0
            });
        } else {
            // ไม่พบสัญญาเช่า หรือห้องว่าง
            res.status(404).json({ message: "ไม่พบข้อมูลสัญญาเช่าห้องนี้" });
        }

    } catch (err) {
        console.error("Get Meter Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};
*/
// controllers/paymentController.js
const pool = require("../config/db");

// Helper function: จัดการกับค่าที่ไม่เป็นตัวเลข (เพื่อความปลอดภัย)
const safeParseFloat = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
};

// --- 1. สร้างใบแจ้งหนี้ (Create Invoice) ---
exports.createPayment = async (req, res) => {
    const client = await pool.connect(); 
    try {
        await client.query('BEGIN');
        
        const { 
            room_number,
            billing_date, due_date,
            room_fee,
            elec_last, elec_curr, elec_fee,
            water_last, water_curr, water_fee,
            total_amount,
            payment_status
        } = req.body;

        if (!room_number || !billing_date || !due_date || !total_amount) {
             return res.status(400).json({ message: "ข้อมูลสำคัญไม่ครบถ้วน (Room, Dates, Total)." });
        }

        const contractSql = `
            SELECT l.contract_id, r.room_id 
            FROM lease_contract l
            JOIN rooms r ON l.room_id = r.room_id
            WHERE r.room_number = $1 AND r.room_status = 'occupied'
            ORDER BY l.start_date DESC LIMIT 1
        `;
        const contractRes = await client.query(contractSql, [room_number]);

        if (contractRes.rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบสัญญาเช่าที่ใช้งานอยู่สำหรับห้องนี้" });
        }
        const { contract_id, room_id } = contractRes.rows[0];

        // 3. บันทึก Payment
        const insertSql = `
            INSERT INTO payments (
                contract_id, billing_date, due_date,
                room_fee, 
                electricity_meter_last, electricity_meter_current, electricity_fee,
                water_meter_last, water_meter_current, water_fee,
                total_amount, payment_status, room_id -- เพิ่ม room_id เพื่อความสะดวกในการค้นหา/กรอง
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING payment_id
        `;

        const result = await client.query(insertSql, [
            contract_id, billing_date, due_date,
            safeParseFloat(room_fee),
            safeParseFloat(elec_last), safeParseFloat(elec_curr), safeParseFloat(elec_fee),
            safeParseFloat(water_last), safeParseFloat(water_curr), safeParseFloat(water_fee),
            safeParseFloat(total_amount), payment_status || 'unpaid', room_id
        ]);
        
        await client.query('COMMIT'); // ยืนยัน Transaction
        res.status(201).json({ message: "สร้างบิลสำเร็จ", payment_id: result.rows[0].payment_id });

    } catch (err) {
        await client.query('ROLLBACK'); // ยกเลิก Transaction หากมี Error
        console.error("Create Payment Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    } finally {
        client.release();
    }
};

exports.getAllPayments = async (req, res) => {
    try {
        const { search, status } = req.query;
        
        let conditions = [];
        let values = [];
        let valueIndex = 1;

        // Search (ค้นหาด้วยเลขห้อง)
        if (search) {
            conditions.push(`r.room_number ILIKE $${valueIndex++}`);
            values.push(`%${search}%`);
        }

        // Status Filter
        if (status && status !== 'all') {
            conditions.push(`p.payment_status = $${valueIndex++}`);
            values.push(status);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const sql = `
            SELECT 
                p.payment_id, p.billing_date, p.due_date, p.total_amount, p.payment_status,
                p.electricity_fee, p.water_fee, p.room_fee,
                r.room_number, r.building,
                t.first_name, t.last_name
            FROM payments p
            JOIN lease_contract l ON p.contract_id = l.contract_id
            JOIN rooms r ON l.room_id = r.room_id
            JOIN tenants t ON l.tenant_id = t.tenant_id
            ${whereClause}
            ORDER BY p.billing_date DESC, r.room_number ASC
        `;
        
        const result = await pool.query(sql, values);

        // จัดรูปแบบข้อมูลให้เหมือนที่ Frontend ต้องการ
        const formattedResults = result.rows.map(row => ({
            id: row.payment_id,
            billing_date: row.billing_date.toISOString().split('T')[0],
            due_date: row.due_date.toISOString().split('T')[0],
            total_amount: row.total_amount,
            payment_status: row.payment_status,
            room_number: row.room_number,
            // ข้อมูลเสริมที่อาจใช้ในอนาคต:
            tenant_name: `${row.first_name} ${row.last_name}`,
            details: {
                room_fee: row.room_fee,
                elec_fee: row.electricity_fee,
                water_fee: row.water_fee,
            }
        }));

        res.json(formattedResults);
    } catch (err) {
        console.error("Get All Payments Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 3. อัปเดตสถานะ (จ่ายเงินแล้ว/ยังไม่จ่าย) ---
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body; // รับแค่ status จาก Frontend
        
        if (!['paid', 'unpaid'].includes(payment_status)) {
             return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
        }

        // ถ้าสถานะเป็น 'paid' ให้อัปเดต payment_date เป็นปัจจุบัน ถ้าเป็น 'unpaid' ให้เป็น NULL
        const payDate = (payment_status === 'paid') ? 'NOW()' : 'NULL';

        const sql = `
            UPDATE payments 
            SET payment_status = $1, payment_date = ${payDate}
            WHERE payment_id = $2
            RETURNING *
        `;
        
        const result = await pool.query(sql, [payment_status, id]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: "ไม่พบบิลที่ต้องการอัปเดต" });
        res.json({ message: "Updated", payment: result.rows[0] });

    } catch (err) {
        console.error("Update Payment Status Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 4. ดึงข้อมูลมิเตอร์ล่าสุดและค่าเช่า (สำหรับ Modal) ---
exports.getLatestMeterAndFee = async (req, res) => {
    try {
        const { room_number } = req.params;

        // 1. ดึงข้อมูลสัญญาที่ใช้งานอยู่: ค่าเช่า, tenant_id, room_id
        // 2. ดึงมิเตอร์ล่าสุดจากบิลก่อนหน้าของสัญญานั้นๆ
        const sql = `
            SELECT 
                l.rent_price AS room_fee,
                l.contract_id,
                t.tenant_id,
                r.room_id,
                COALESCE(
                    (
                        SELECT p.electricity_meter_current 
                        FROM payments p 
                        WHERE p.contract_id = l.contract_id 
                        ORDER BY p.billing_date DESC LIMIT 1
                    ), 0
                ) AS elec_last_meter,
                COALESCE(
                    (
                        SELECT p.water_meter_current 
                        FROM payments p 
                        WHERE p.contract_id = l.contract_id 
                        ORDER BY p.billing_date DESC LIMIT 1
                    ), 0
                ) AS water_last_meter
            FROM lease_contract l
            JOIN rooms r ON l.room_id = r.room_id
            JOIN tenants t ON l.tenant_id = t.tenant_id
            WHERE r.room_number = $1 AND r.room_status = 'occupied'
            ORDER BY l.start_date DESC
            LIMIT 1
        `;

        const result = await pool.query(sql, [room_number]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบข้อมูลสัญญาเช่าที่ใช้งานอยู่สำหรับห้องนี้" });
        }

        const data = result.rows[0];
        // ส่งกลับค่าที่ Frontend คาดหวัง
        res.json({
            room_id: data.room_id,
            tenant_id: data.tenant_id,
            room_fee: safeParseFloat(data.room_fee), // ใช้ฟังก์ชันเพื่อความปลอดภัย
            elec_last_meter: safeParseFloat(data.elec_last_meter),
            water_last_meter: safeParseFloat(data.water_last_meter),
        });

    } catch (err) {
        console.error("Get Meter/Fee Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};