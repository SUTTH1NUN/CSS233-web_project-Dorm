// backend/controllers/paymentController.js
const pool = require("../config/db");

// 1. ดึงรายการ Payments ทั้งหมด (สำหรับตารางหน้าแรก)
exports.getAllPayments = async (req, res) => {
    try {
        // Query นี้จะ Join เพื่อดึงเลขห้อง (rooms) และชื่อผู้เช่า (tenants) มาแสดงด้วย
        const query = `
            SELECT 
                p.payment_id,
                p.total_amount,
                p.payment_status,
                p.billing_date,
                p.due_date,
                r.room_number,
                t.first_name,
                t.last_name
            FROM payments p
            JOIN lease_contract lc ON p.contract_id = lc.contract_id
            JOIN rooms r ON lc.room_id = r.room_id
            JOIN tenants t ON lc.tenant_id = t.tenant_id
            ORDER BY p.payment_id DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// 2. ดึงข้อมูลสัญญาและมิเตอร์ล่าสุดตามเลขห้อง (ใช้ตอน Auto Fetch ใน Modal)
// backend/controllers/paymentController.js

exports.getBillingInfoByRoom = async (req, res) => {
    const { room_number } = req.params;
    try {
        const query = `
            SELECT 
                lc.contract_id,
                r.room_type,
                ri.room_price,
                COALESCE(
                    (SELECT electricity_meter_current 
                     FROM payments p 
                     WHERE p.contract_id = lc.contract_id 
                     AND p.payment_status != 'cancelled'  -- [เพิ่มบรรทัดนี้] มองข้ามบิลที่ยกเลิก
                     ORDER BY payment_id DESC LIMIT 1),
                    0
                ) as last_elec,
                COALESCE(
                    (SELECT water_meter_current 
                     FROM payments p 
                     WHERE p.contract_id = lc.contract_id 
                     AND p.payment_status != 'cancelled'  -- [เพิ่มบรรทัดนี้] มองข้ามบิลที่ยกเลิก
                     ORDER BY payment_id DESC LIMIT 1),
                    0
                ) as last_water
            FROM lease_contract lc
            JOIN rooms r ON lc.room_id = r.room_id
            JOIN room_info ri ON r.room_type = ri.room_type
            WHERE r.room_number = $1 AND lc.contract_status = 'active'
        `;

        const result = await pool.query(query, [room_number]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: "Room not found or no active contract" });
        }

        const data = result.rows[0];
        res.json({
            contract_id: data.contract_id,
            room_price: data.room_price,
            last_elec: parseFloat(data.last_elec),
            last_water: parseFloat(data.last_water)
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// 3. สร้างใบแจ้งหนี้ใหม่ (Create Invoice)
exports.createPayment = async (req, res) => {
    // รับค่าทั้งหมดจาก Frontend
    const { 
        contract_id, billing_date, due_date,
        water_meter_last, water_meter_current, water_fee,
        electricity_meter_last, electricity_meter_current, electricity_fee,
        room_fee, total_amount, payment_status 
    } = req.body;

    try {
        const query = `
            INSERT INTO payments (
                contract_id, 
                billing_date, 
                due_date,
                water_meter_last, 
                water_meter_current, 
                water_fee,
                electricity_meter_last, 
                electricity_meter_current, 
                electricity_fee,
                room_fee, 
                total_amount, 
                payment_status, 
                payment_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 
                $12::payment_status_enum,
                CASE 
                    WHEN $12::text = 'paid' THEN CURRENT_TIMESTAMP
                    ELSE NULL 
                END
            )
            RETURNING *
        `;

        const values = [
            contract_id, 
            billing_date, 
            due_date,
            water_meter_last, 
            water_meter_current, 
            water_fee,
            electricity_meter_last, 
            electricity_meter_current, 
            electricity_fee,
            room_fee, 
            total_amount, 
            payment_status
        ];

        const result = await pool.query(query, values);
        
        res.json({ 
            msg: "Invoice created successfully", 
            payment: result.rows[0] 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error: " + err.message);
    }
};

// (แถม) 4. อัปเดตสถานะการชำระเงิน (เผื่อใช้ตอนกดปุ่มแก้ไขสถานะ)
exports.updatePaymentStatus = async (req, res) => {
    const { id } = req.params; // payment_id
    const { status } = req.body; // 'paid' or 'unpaid'

    try {
        const query = `
            UPDATE payments
            SET payment_status = $1,
                payment_date = CASE WHEN $1 = 'paid' THEN CURRENT_TIMESTAMP ELSE NULL END
            WHERE payment_id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: "Payment not found" });
        }

        res.json({ msg: "Status updated", payment: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// ... (code เดิม)

// 4. ดึงข้อมูลบิลรายตัว (Get Payment by ID) - ใช้สำหรับ View/Edit
exports.getPaymentById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                p.*,
                r.room_number,
                r.room_type,
                ri.room_price
            FROM payments p
            JOIN lease_contract lc ON p.contract_id = lc.contract_id
            JOIN rooms r ON lc.room_id = r.room_id
            JOIN room_info ri ON r.room_type = ri.room_type
            WHERE p.payment_id = $1
        `;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: "Payment not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// 5. อัปเดตข้อมูลบิล (Update Payment)
exports.updatePayment = async (req, res) => {
    const { id } = req.params;
    const { 
        billing_date, due_date,
        water_meter_last, water_meter_current, water_fee,
        electricity_meter_last, electricity_meter_current, electricity_fee,
        room_fee, total_amount, payment_status 
    } = req.body;

    try {
        const query = `
            UPDATE payments SET
                billing_date = $1, 
                due_date = $2,
                water_meter_last = $3, 
                water_meter_current = $4, 
                water_fee = $5,
                electricity_meter_last = $6, 
                electricity_meter_current = $7, 
                electricity_fee = $8,
                room_fee = $9, 
                total_amount = $10, 
                payment_status = $11::payment_status_enum,
                payment_date = CASE WHEN $11::text = 'paid' THEN CURRENT_TIMESTAMP ELSE payment_date END
            WHERE payment_id = $12
            RETURNING *
        `;

        const values = [
            billing_date, due_date,
            water_meter_last, water_meter_current, water_fee,
            electricity_meter_last, electricity_meter_current, electricity_fee,
            room_fee, total_amount, payment_status, 
            id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: "Payment not found" });
        }

        res.json({ msg: "Payment updated successfully", payment: result.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};