require('dotenv').config();
const pool = require('./src/config/database');

async function migrate() {
  try {
    const conn = await pool.getConnection();

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS recipe_images (
        id VARCHAR(36) PRIMARY KEY,
        mime_type VARCHAR(50) NOT NULL,
        data LONGBLOB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created recipe_images table');

    conn.release();
    console.log("Migration complete!");
  } catch (err) {
    console.error("SQL Error:", err.message);
  }
  process.exit();
}
migrate();
