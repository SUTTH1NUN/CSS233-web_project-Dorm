// backend/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '30d';

exports.registerAdmin = async (req, res) => {
    try {
        const { first_name, last_name, username, password } = req.body;

        if (!first_name || !last_name || !username || !password) {
            return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const sql = `
            INSERT INTO admins (first_name, last_name, username, password_hash) 
            VALUES ($1, $2, $3, $4) 
            RETURNING admin_id, username, first_name
        `;
        
        const values = [first_name, last_name, username, hashedPassword];
        const newAdmin = await pool.query(sql, values);

        res.status(201).json({
            message: "สร้าง Admin ใหม่สำเร็จ!",
            user: newAdmin.rows[0],
        });

    } catch (err) {
        // Error Code 23505 คือ Unique Violation (ข้อมูลซ้ำ) ใน PostgreSQL
        if (err.code === "23505") {
            return res.status(409).json({ error: "Username นี้ถูกใช้งานแล้ว" });
        }
        console.error("Register Admin Error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ error: "กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน" });
        }

        let user = null;
        let role = null;
        let userId = null;

        // 1. ลองค้นหาในตาราง Admins (ค้นหาด้วย Username)
        const adminSql = `SELECT * FROM admins WHERE username = $1`;
        const adminResult = await pool.query(adminSql, [identifier]);

        if (adminResult.rows.length > 0) {
            user = adminResult.rows[0];
            role = "admin";
            userId = user.admin_id;
        } else {
            // 2. ถ้าไม่ใช่ Admin ให้ค้นหาในตาราง Tenants (ค้นหาด้วย Email)
            const tenantSql = `SELECT * FROM tenants WHERE email = $1`;
            const tenantResult = await pool.query(tenantSql, [identifier]);
            
            if (tenantResult.rows.length > 0) {
                user = tenantResult.rows[0];
                role = "tenant";
                userId = user.tenant_id;
            }
        }

        // ถ้าหาไม่เจอทั้งสองตาราง
        if (!user) {
            return res.status(401).json({ error: "ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง" });
        }

        // 3. ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง" });
        }

        const payload = {
            id: userId,
            role: role,
            name: user.first_name,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

        res.json({
            message: "เข้าสู่ระบบสำเร็จ!",
            token: token,
            user: payload,
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
};