const pool = require('../config/database');

const toggleFavorite = async (req, res) => {
  const { recipe_id } = req.params;

  try {
    const conn = await pool.getConnection();

    // Verificar que la receta existe
    const [recipes] = await conn.execute(
      'SELECT id FROM recipes WHERE id = ?',
      [recipe_id]
    );

    if (recipes.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    // Verificar si ya existe el favorito
    const [existing] = await conn.execute(
      'SELECT id FROM favorites WHERE recipe_id = ? AND user_id = ?',
      [recipe_id, req.user.id]
    );

    if (existing.length > 0) {
      // Si existe, eliminar
      await conn.execute(
        'DELETE FROM favorites WHERE recipe_id = ? AND user_id = ?',
        [recipe_id, req.user.id]
      );
      conn.release();
      return res.json({ message: 'Favorito eliminado', isFavorite: false });
    } else {
      // Si no existe, agregar
      await conn.execute(
        'INSERT INTO favorites (id, recipe_id, user_id) VALUES (UUID(), ?, ?)',
        [recipe_id, req.user.id]
      );
      conn.release();
      return res.status(201).json({ message: 'Favorito agregado', isFavorite: true });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMyFavorites = async (req, res) => {
  try {
    const conn = await pool.getConnection();

    const [rows] = await conn.execute(`
      SELECT 
        r.id, r.user_id, r.title, r.description, r.image_url, r.created_at, r.updated_at,
        u.username,
        c.id as comment_id,
        c.content as comment_content,
        c.user_id as comment_user_id,
        cu.username as comment_username,
        c.created_at as comment_created_at
      FROM favorites f
      LEFT JOIN recipes r ON f.recipe_id = r.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN comments c ON r.id = c.recipe_id
      LEFT JOIN users cu ON c.user_id = cu.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC, c.created_at ASC
    `, [req.user.id]);

    conn.release();

    const favoritesMap = new Map();
    for (const row of rows) {
      if (!row.id) continue;
      if (!favoritesMap.has(row.id)) {
        favoritesMap.set(row.id, {
          id: row.id,
          user_id: row.user_id,
          title: row.title,
          description: row.description,
          image_url: row.image_url,
          created_at: row.created_at,
          updated_at: row.updated_at,
          username: row.username,
          comments: []
        });
      }
      if (row.comment_id) {
        favoritesMap.get(row.id).comments.push({
          id: row.comment_id,
          content: row.comment_content,
          user_id: row.comment_user_id,
          username: row.comment_username,
          created_at: row.comment_created_at
        });
      }
    }

    res.json(Array.from(favoritesMap.values()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { toggleFavorite, getMyFavorites };
