// /backend/server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
// ❗️ ไม่ต้อง require 'pg', 'bcrypt', 'jwt' ที่นี่แล้ว!

dotenv.config();

const app = express();
const port = 3030; // (ใช้พอร์ต 3030 ตาม docker-compose)

// --- Middlewares (ยังอยู่เหมือนเดิม) ---
app.use(cors());
app.use(express.json());

// ⭐️ --- นำเข้า (Import) Routes --- ⭐️
const authRoutes = require("./routes/auth");
// (ในอนาคต เราจะมีไฟล์อื่นอีก เช่น)
// const tenantRoutes = require("./routes/tenant");
// const roomRoutes = require("./routes/room");

// ⭐️ --- ใช้งาน Routes (เชื่อมแผงวงจรย่อย) --- ⭐️
// บอก Server ว่า ถ้ามีการเรียก API ที่ขึ้นต้นด้วย /api/auth
// ให้ส่งต่อไปให้ 'authRoutes' (ไฟล์ auth.js) จัดการ
app.use("/api/auth", authRoutes);

// (ในอนาคต...)
// app.use("/api/tenants", tenantRoutes);
// app.use("/api/rooms", roomRoutes);

// --- Start Server ---
app.listen(port, () => {
  console.log(`🚀 Backend server running at http://localhost:${port}`);
});