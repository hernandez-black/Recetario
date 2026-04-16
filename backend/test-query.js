require('dotenv').config();
const pool = require('./src/config/database');

async function test() {
  try {
    const conn = await pool.getConnection();
    const [recipes] = await conn.execute(`
      SELECT 
        r.*,
        u.username,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', c.id,
            'content', c.content,
            'user_id', c.user_id,
            'username', cu.username,
            'created_at', c.created_at
          )
        ) as comments
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN comments c ON r.id = c.recipe_id
      LEFT JOIN users cu ON c.user_id = cu.id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `);
    console.log("Success number of recipes:", recipes.length);
    conn.release();
  } catch (err) {
    console.error("SQL Error:", err.message);
  }
  process.exit();
}
test();
