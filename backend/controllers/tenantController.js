const bcrypt = require("bcrypt");
const pool = require("../config/db");

const SALT_ROUNDS = 10;

// 1. ลงทะเบียนผู้เช่าใหม่ + ทำสัญญา + จองห้อง (Transaction)
exports.registerTenant = async (req, res) => {
    const {
        first_name, last_name, phone_number, email, tenant_status,
        building, floor, room_number, 
        start_date, end_date, deposit_amount
    } = req.body;

    // Validation Inputs
    if (!first_name || !last_name || !phone_number || !email || !tenant_status || 
        !building || !room_number || !floor || 
        !start_date || !deposit_amount) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    // ใช้ client จาก pool เพื่อทำ Transaction
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Step 1: ตรวจสอบสถานะห้อง
        const roomSql = `
            SELECT room_id, room_status 
            FROM rooms 
            WHERE building = $1 AND floor = $2 AND room_number = $3
        `;
        const roomRes = await client.query(roomSql, [building, floor, room_number]);

        if (roomRes.rows.length === 0) {
            throw new Error(`ไม่พบห้องพักที่ระบุ: ${building} ชั้น ${floor} ห้อง ${room_number}`);
        }

        const room = roomRes.rows[0];
        if (room.room_status !== 'available') {
            throw new Error('ห้องพักนี้ไม่ว่าง');
        }

        // Step 2: สร้าง User Tenant (ใช้เบอร์โทรเป็นรหัสผ่านตั้งต้น)
        const hashedPassword = await bcrypt.hash(phone_number, SALT_ROUNDS);

        const createTenantSql = `
            INSERT INTO tenants (first_name, last_name, phone_number, email, tenant_status, password_hash)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING tenant_id, first_name, last_name, email, tenant_status
        `;
        const newTenant = await client.query(createTenantSql, [
            first_name, last_name, phone_number, email, tenant_status, hashedPassword
        ]);
        
        const tenantId = newTenant.rows[0].tenant_id;
        
        // Step 3: สร้างสัญญาเช่า (Lease Contract)
        const createContractSql = `
            INSERT INTO lease_contract (tenant_id, room_id, start_date, end_date, deposit_amount) 
            VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(createContractSql, [
            tenantId, room.room_id, start_date, end_date || null, deposit_amount
        ]);

        // Step 4: อัปเดตสถานะห้องเป็น 'occupied'
        const updateRoomSql = `UPDATE rooms SET room_status = 'occupied' WHERE room_id = $1`;
        await client.query(updateRoomSql, [room.room_id]);

        await client.query('COMMIT');

        res.status(201).json({
            message: "เพิ่มผู้เช่าและทำสัญญาสำเร็จ!",
            tenant: newTenant.rows[0],
        });

    } catch (err) {
        await client.query('ROLLBACK');
        
        // Error Code 23505 = Unique Violation (ข้อมูลซ้ำ)
        if (err.code === "23505") {
            return res.status(409).json({ message: "อีเมลหรือเบอร์โทรนี้มีอยู่ในระบบแล้ว" });
        }
        
        console.error("Register Tenant Error:", err.message);
        // ส่ง Error message กลับไปหากเป็น Error ที่เรา throw เอง (เช่น ห้องไม่ว่าง)
        res.status(500).json({ message: err.message || "Server Error" });

    } finally {
        client.release();
    }
};

// 2. ดึงรายชื่อผู้เช่าทั้งหมด (พร้อมระบบ Filter และ Search)
exports.getAllTenants = async (req, res) => {
    try {
        const { search, status } = req.query;
        
        let sql = `
            SELECT 
                t.tenant_id, 
                t.first_name, 
                t.last_name, 
                t.phone_number, 
                t.tenant_status, 
                r.room_number
            FROM tenants t
            JOIN lease_contract l ON t.tenant_id = l.tenant_id
            JOIN rooms r ON l.room_id = r.room_id
            WHERE 1=1
        `;
        
        const params = [];

        // Filter by Status
        if (status && status !== 'all') {
            params.push(status);
            sql += ` AND t.tenant_status = $${params.length}`;
        }

        // Filter by Search Text (Name, Phone, Room)
        if (search) {
            params.push(`%${search}%`);
            const idx = params.length;
            sql += ` AND (
                t.first_name ILIKE $${idx} OR 
                t.last_name ILIKE $${idx} OR 
                t.phone_number ILIKE $${idx} OR 
                r.room_number ILIKE $${idx}
            )`;
        }
        
        sql += ` ORDER BY t.tenant_id ASC`;
        
        const result = await pool.query(sql, params);
        res.json(result.rows);

    } catch (err) {
        console.error("Get All Tenants Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. ดึงข้อมูลผู้เช่ารายคน (Detail)
exports.getTenantById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const sql = `
            SELECT 
                t.tenant_id, t.first_name, t.last_name, t.email, t.phone_number, t.tenant_status,
                r.building, r.floor, r.room_number,
                l.start_date, l.end_date, l.deposit_amount
            FROM tenants t
            JOIN lease_contract l ON t.tenant_id = l.tenant_id
            JOIN rooms r ON l.room_id = r.room_id
            WHERE t.tenant_id = $1
        `;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลผู้เช่า' });
        }

        res.json(result.rows[0]); 

    } catch (err) {
        console.error("Get Tenant By ID Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. แก้ไขข้อมูลผู้เช่า (Transaction)
exports.updateTenant = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const {
            first_name, last_name, email, phone_number,
            tenant_status, deposit_amount, start_date, end_date,
            // รับค่าข้อมูลห้องใหม่มาด้วย (ถ้ามีการเปลี่ยน)
            building, floor, room_number 
        } = req.body;

        await client.query('BEGIN');

        //Update ข้อมูลส่วนตัวผู้เช่า (Tenant Info)
        const updateTenantSql = `
            UPDATE tenants 
            SET first_name = $1, 
                last_name = $2, 
                email = $3, 
                phone_number = $4, 
                tenant_status = $5
            WHERE tenant_id = $6
        `;
        await client.query(updateTenantSql, [first_name, last_name, email, phone_number, tenant_status, id]);

        // ดึง room_id ปัจจุบันจากสัญญา (เพื่อเอาไว้เช็คว่ามีการเปลี่ยนห้องไหม)
        const currentContractRes = await client.query(
            'SELECT contract_id, room_id FROM lease_contract WHERE tenant_id = $1 LIMIT 1', 
            [id]
        );
        
        let oldRoomId = null;
        if (currentContractRes.rows.length > 0) {
            oldRoomId = currentContractRes.rows[0].room_id;
        }

        // ---------------------------------------------------------
        // CASE A: ผู้เช่าย้ายออก (Inactive / Vacated) -> คืนห้องเดิม
        // ---------------------------------------------------------
        if (tenant_status === 'inactive' || tenant_status === 'vacated') {
            if (oldRoomId) {
                await client.query("UPDATE rooms SET room_status = 'available' WHERE room_id = $1", [oldRoomId]);
            }
        } 
        // ---------------------------------------------------------
        // CASE B: ผู้เช่ายังอยู่ (Active) แต่มีการ "ย้ายห้อง" (Move Room)
        // ---------------------------------------------------------
        else if (building && floor && room_number) {
            
            // หา room_id ของห้องใหม่ที่ระบุมา
            const newRoomRes = await client.query(
                "SELECT room_id, room_status FROM rooms WHERE building = $1 AND floor = $2 AND room_number = $3",
                [building, floor, room_number]
            );

            if (newRoomRes.rows.length === 0) {
                throw new Error(`ไม่พบห้องพัก: ${building} ชั้น ${floor} ห้อง ${room_number}`);
            }

            const newRoom = newRoomRes.rows[0];
            const newRoomId = newRoom.room_id;

            // เช็คว่าห้องเปลี่ยนไปจากเดิมหรือไม่
            if (oldRoomId && oldRoomId !== newRoomId) {
                
                // ตรวจสอบว่าห้องใหม่ว่างไหม?
                if (newRoom.room_status !== 'available') {
                    throw new Error(`ห้อง ${room_number} ไม่ว่าง (สถานะ: ${newRoom.room_status})`);
                }

                // A. คืนห้องเก่า -> Available
                await client.query("UPDATE rooms SET room_status = 'available' WHERE room_id = $1", [oldRoomId]);

                // B. จองห้องใหม่ -> Occupied
                await client.query("UPDATE rooms SET room_status = 'occupied' WHERE room_id = $1", [newRoomId]);

                // C. อัปเดตสัญญาเช่าให้ชี้ไปที่ห้องใหม่
                await client.query(
                    "UPDATE lease_contract SET room_id = $1 WHERE tenant_id = $2", 
                    [newRoomId, id]
                );
            }
        }

        // Update ข้อมูลสัญญาอื่นๆ (เงินมัดจำ, วันที่)
        const updateContractSql = `
            UPDATE lease_contract
            SET deposit_amount = $1, 
                start_date = $2, 
                end_date = $3
            WHERE tenant_id = $4
        `;
        await client.query(updateContractSql, [deposit_amount, start_date, end_date || null, id]);

        await client.query('COMMIT');
        res.json({ message: 'อัปเดตข้อมูลและจัดการห้องพักเรียบร้อยแล้ว' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Update Tenant Error:", err.message);
        res.status(500).json({ message: err.message || "Server Error" });
    } finally {
        client.release();
    }
};

exports.resetTenantPassword = async (req, res) => {
    try {
        const { id } = req.params;

        // ดึงเบอร์โทรมาเพื่อใช้เป็นรหัสผ่าน
        const tenantRes = await pool.query("SELECT phone_number FROM tenants WHERE tenant_id = $1", [id]);
        
        if (tenantRes.rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบผู้เช่า" });
        }

        const phoneNumber = tenantRes.rows[0].phone_number;
        const hashedPassword = await bcrypt.hash(phoneNumber, SALT_ROUNDS);

        await pool.query("UPDATE tenants SET password_hash = $1 WHERE tenant_id = $2", [hashedPassword, id]);

        res.json({ message: "รีเซ็ตรหัสผ่านเรียบร้อยแล้ว (รหัสผ่านคือเบอร์โทรศัพท์)" });

    } catch (err) {
        console.error("Reset Password Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};