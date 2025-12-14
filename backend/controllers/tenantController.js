//controllers/tenantController.js

const bcrypt = require("bcrypt");
const pool = require("../config/db");

exports.registerTenant = async (req, res) => {
  const {first_name, last_name, phone_number, email, tenant_status,
        building, floor, room_number, 
        start_date, end_date, deposit_amount
  } = req.body;

  if(!first_name || !last_name || !phone_number || !email ||!tenant_status 
    || !building || !room_number || !floor 
    || !start_date || !deposit_amount){
    return res.status(400).json({error : "กรุณากรอกข้อมูลให้ครบถ้วน"});
  }

  const client = await pool.connect();
  try{
    await client.query('BEGIN');

    // 1. เช็คห้องว่าง
    const roomQuery = await client.query(
      `select room_id, room_status from rooms where building = $1 and floor = $2 and room_number = $3`,
      [building, floor, room_number]
    );

    if (roomQuery.rows.length === 0){
      throw new Error(`ไม่พบห้องพักที่ build:${building} floor:${floor} room no.:${room_number} `);
    }
    const room = roomQuery.rows[0];
    if (room.room_status !== 'available'){
      throw new Error('ห้องพักไม่ว่าง');
    }

    // 2. สร้าง User Tenant
    const defaultPassword = phone_number;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newTenant = await client.query(
      `insert into tenants (first_name, last_name, phone_number, email, tenant_status, password_hash)
      values ($1, $2, $3, $4, $5, $6)
      returning tenant_id, first_name, last_name, email, tenant_status`,
      [first_name, last_name, phone_number, email, tenant_status, hashedPassword]
    );
    const tenantId = newTenant.rows[0].tenant_id;
    
    // 3. สร้างสัญญา
    await client.query(
      `insert into lease_contract (tenant_id, room_id, start_date, end_date, deposit_amount) values ($1, $2, $3, $4, $5)`,
      [tenantId, room.room_id, start_date, end_date || null, deposit_amount]
    );

    // 4. อัพเดทสถานะห้อง
    await client.query(`update rooms set room_status = 'occupied' where room_id = $1`, [room.room_id]);

    await client.query('COMMIT');

    res.status(201).json({
      message: "เพิ่มผู้เช่าและทำสัญญาสำเร็จ!",
      tenant: newTenant.rows[0],
    });
  } catch (err){
    await client.query('ROLLBACK');
    if (err.code === "23505") {
        return res.status(409).json({ error: "อีเมลหรือเบอร์นี้มีอยู่ในระบบแล้ว" });
    }
    console.error("Register tenant error", err.message);
    res.status(500).json({message: err.message || "server error"});
  } finally {
    client.release();
  }
};

exports.getAllTenants = async (req, res) => {
  try{
    const {search, status} = req.query;
    let sql = `
      select t.tenant_id, t.first_name, t.last_name, t.phone_number, t.tenant_status, r.room_number
      from tenants t
      join lease_contract l on t.tenant_id = l.tenant_id
      join rooms r on l.room_id = r.room_id
      where 1=1
    `;
    const param = [];

    if(status && status !== 'all'){
        param.push(status);
        sql += ` and t.tenant_status = $${param.length}`;
    }

    if (search) {
      param.push(`%${search}%`);
      const idx = param.length;
      sql += ` and (
        t.first_name ilike $${idx} OR 
        t.last_name ilike $${idx} OR 
        t.phone_number ilike $${idx} OR 
        r.room_number ilike $${idx}
      )`;
    }
    
    sql += ` order by t.tenant_id ASC`;
    const tenant_query = await pool.query(sql, param);
    res.json(tenant_query.rows);

  } catch (error){
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};


exports.getTenantById = async (req, res, next) => {
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

        const { rows } = await pool.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลผู้เช่า' });
        }

        res.json(rows[0]); 
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.updateTenant = async (req, res, next) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const {
            first_name, last_name, email, phone_number,
            tenant_status, deposit_amount, start_date, end_date
        } = req.body;

        await client.query('BEGIN');

        const updateTenantSql = `
            UPDATE tenants 
            SET first_name=$1, last_name=$2, email=$3, phone_number=$4, tenant_status=$5
            WHERE tenant_id=$6
        `;
        await client.query(updateTenantSql, [first_name, last_name, email, phone_number, tenant_status, id]);
        if (tenant_status === 'inactive' || tenant_status === 'vacated') {
            const roomRes = await client.query('SELECT room_id FROM lease_contract WHERE tenant_id = $1', [id]);
            if(roomRes.rows.length > 0) {
                await client.query("UPDATE rooms SET room_status = 'available' WHERE room_id = $1", [roomRes.rows[0].room_id]);
            }
        }
        //ค่อยมาทำย้ายห้อง
        const updateContractSql = `
            UPDATE lease_contract
            SET deposit_amount=$1, start_date=$2, end_date=$3
            WHERE tenant_id=$4
        `;
        await client.query(updateContractSql, [deposit_amount, start_date, end_date || null, id]);

        await client.query('COMMIT');
        res.json({ message: 'อัปเดตข้อมูลสำเร็จ' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    } finally {
        client.release();
    }
};