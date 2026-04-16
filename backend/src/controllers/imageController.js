const pool = require('../config/database');

const getImage = async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute('SELECT mime_type, data FROM recipe_images WHERE id = ?', [id]);
    conn.release();

    if (rows.length === 0) {
      // Devolver un pixel transparente o imagen por defecto en caso de no existir
      const transparentPixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      res.set('Content-Type', 'image/gif');
      return res.send(transparentPixel);
    }

    const { mime_type, data } = rows[0];
    res.set('Content-Type', mime_type);
    res.send(data);
  } catch (error) {
    console.error('Error al recuperar imagen:', error);
    res.status(500).json({ error: 'Error al recuperar la imagen' });
  }
};

module.exports = { getImage };
