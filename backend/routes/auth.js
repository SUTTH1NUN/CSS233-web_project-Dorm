// /backend/routes/auth.js

const express = require("express");
const router = express.Router(); // ⭐️ สร้าง Router
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db"); // ⭐️ ดึง Pool มาจากไฟล์ที่เราสร้าง

// --- ฟังก์ชัน Register Admin ---
// ❗️ สังเกต: เราเปลี่ยนจาก app.post เป็น router.post
// ❗️ สังเกต: Path เปลี่ยนจาก /api/register/admin เป็น /register/admin
//           (เพราะเดี๋ยวเราจะเติม /api/auth ข้างนอก)

router.post("/register/admin", async (req, res) => {
  const { first_name, last_name, username, password } = req.body;
  if (!first_name || !last_name || !username || !password) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = await pool.query(
      "INSERT INTO admin (first_name, last_name, username, password_hash) VALUES ($1, $2, $3, $4) RETURNING admin_id, username",
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
});

// --- ฟังก์ชัน Login ---
// ❗️ สังเกต: เปลี่ยนเป็น router.post และ Path เป็น /login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: "กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน" });
    }

    let user = null;
    let role = null;
    let userId = null;

    // (Logic การค้นหา admin และ tenant เหมือนเดิม... )
    const adminQuery = await pool.query(
      "SELECT * FROM admin WHERE username = $1",
      [identifier]
    );
    if (adminQuery.rows.length > 0) {
      user = adminQuery.rows[0];
      role = "admin";
      userId = user.admin_id;
    } else {
      const tenantQuery = await pool.query(
        "SELECT * FROM tenants WHERE email = $1",
        [identifier]
      );
      if (tenantQuery.rows.length > 0) {
        user = tenantQuery.rows[0];
        role = "tenant";
        userId = user.tenant_id;
      }
    }
    if (!user) {
      return res
        .status(401)
        .json({ error: "ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง" });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง" });
    }

    // (Logic การสร้าง JWT เหมือนเดิม... )
    const payload = { id: userId, role: role, name: user.first_name };
    const secretKey = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

    res.json({
      message: "เข้าสู่ระบบสำเร็จ!",
      token: token,
      user: payload,
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// ⭐️ ส่งออก (export) router นี้เพื่อให้ server.js เรียกใช้
module.exports = router;