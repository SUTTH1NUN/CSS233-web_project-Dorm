// /backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = 3030;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Import Routes ---
const authRoutes = require("./routes/auth");
const tenantRoutes = require("./routes/tenants");

// --- Mount Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);

// --- Start Server ---
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});