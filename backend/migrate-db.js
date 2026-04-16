require('dotenv').config();
const pool = require('./src/config/database');

async function migrate() {
  try {
    const conn = await pool.getConnection();

    // Check if columns exist
    const [cols] = await conn.execute(`SHOW COLUMNS FROM recipes`);
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('ingredients')) {
      await conn.execute(`ALTER TABLE recipes ADD COLUMN ingredients JSON`);
      console.log('Added ingredients (JSON) column');
    }
    if (!colNames.includes('steps')) {
      await conn.execute(`ALTER TABLE recipes ADD COLUMN steps JSON`);
      console.log('Added steps (JSON) column');
    }
    if (!colNames.includes('diners')) {
      await conn.execute(`ALTER TABLE recipes ADD COLUMN diners VARCHAR(50)`);
      console.log('Added diners VARCHAR(50) column');
    }
    if (!colNames.includes('cook_time')) {
      await conn.execute(`ALTER TABLE recipes ADD COLUMN cook_time VARCHAR(50)`);
      console.log('Added cook_time VARCHAR(50) column');
    }

    conn.release();
    console.log("Migration complete!");
  } catch (err) {
    console.error("SQL Error:", err.message);
  }
  process.exit();
}
migrate();
