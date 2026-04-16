require('dotenv').config();
const pool = require('./src/config/database');

async function test() {
  try {
    const conn = await pool.getConnection();
    await conn.execute(`SELECT JSON_OBJECT("key", "value") as test`);
    console.log("JSON functions supported!");
    conn.release();
  } catch (err) {
    console.error("SQL Error:", err.message);
  }
  process.exit();
}
test();
