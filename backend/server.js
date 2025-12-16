// /backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require('path');

dotenv.config();

const app = express();
const port = 3030;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Import Routes ---
const authRoutes = require("./routes/auth");
const tenantRoutes = require("./routes/tenants");
const announcementRoute = require('./routes/announcement');
const repairRoutes = require('./routes/repair');
const paymentRoutes = require('./routes/payment');
const roomRoutes = require('./routes/room');
const dashboardRoutes = require('./routes/dashboard');
const publicRoutes = require('./routes/public');

// --- Mount Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);// แก้ logic ตอนย้ายห้อง
app.use('/api/announcement', announcementRoute);
app.use('/uploads', express.static('uploads'));
app.use('/api/repairs', repairRoutes); //แก้ความสวยงามเล็กน้อย
app.use("/api/payments", paymentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/public', publicRoutes);

// --- Start Server ---
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});