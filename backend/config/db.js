// /backend/config/db.js

const { Pool } = require("pg");
require("dotenv").config(); // ต้องใช้ .env ที่นี่ด้วย

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});


module.exports = pool;