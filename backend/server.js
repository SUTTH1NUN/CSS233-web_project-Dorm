// /backend/server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = 3030; // (ใช้พอร์ต 3030 ตาม docker-compose)

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Import Routes ---
const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);


// --- Start Server ---
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});