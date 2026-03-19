const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("DB connected:", res.rows);
  } catch (err) {
    console.error("DB connection error:", err.message);
  }
})();