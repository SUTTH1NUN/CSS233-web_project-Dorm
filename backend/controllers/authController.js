const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

exports.registerAdmin = async (req, res) => {
  const { first_name, last_name, username, password } = req.body;

  if (!first_name || !last_name || !username || !password) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = await pool.query(
      "INSERT INTO admins (first_name, last_name, username, password_hash) VALUES ($1, $2, $3, $4) RETURNING admin_id, username, first_name",
      [first_name, last_name, username, hashedPassword]
    );

    res.status(201).json({
      message: "สร้าง Admin ใหม่สำเร็จ!",
      user: newAdmin.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Username นี้ถูกใช้งานแล้ว" });
    }
    console.error("Register Error:", err.message);
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

    // ค้นหาใน admins
    const adminQuery = await pool.query("SELECT * FROM admins WHERE username = $1", [identifier]);
    if (adminQuery.rows.length > 0) {
      user = adminQuery.rows[0];
      role = "admin";
      userId = user.admin_id;
    } else {
      // ค้นหาใน tenants
      const tenantQuery = await pool.query("SELECT * FROM tenants WHERE email = $1", [identifier]);
      if (tenantQuery.rows.length > 0) {
        user = tenantQuery.rows[0];
        role = "tenant";
        userId = user.tenant_id;
      }
    }

    if (!user) {
      return res.status(401).json({ error: "ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง" });
    }

    let tokenExpiry = role === 'tenant' ? '30d' : '30d';

    const payload = {
      id: userId,
      role: role,
      name: user.first_name,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: tokenExpiry });

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