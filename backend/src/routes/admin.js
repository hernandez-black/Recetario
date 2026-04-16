const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const verifyAdmin = require('../middlewares/verifyAdmin');

// 🔐 Proteger todas las rutas - solo admins
router.use(verifyAdmin);

// 📋 Obtener todos los usuarios (sin contraseñas)
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 👁️ Obtener recetas de un usuario específico
router.get('/users/:id/recipes', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el usuario existe
    const [user] = await pool.execute(
      'SELECT id, username FROM users WHERE id = ?', 
      [id]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener recetas del usuario
    const [recipes] = await pool.execute(
      'SELECT id, title, description, image_url, created_at FROM recipes WHERE user_id = ? ORDER BY created_at DESC',
      [id]
    );

    res.json({ 
      user: user[0], 
      recipes 
    });
  } catch (error) {
    console.error('Error obteniendo recetas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🗑️ Eliminar un usuario
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir que un admin se elimine a sí mismo
    if (id === req.user.id) {
      return res.status(400).json({ 
        error: 'No puedes eliminar tu propia cuenta de administrador' 
      });
    }

    // Eliminar en cascada (recetas y comentarios se eliminan automáticamente si tienes FOREIGN KEY)
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🗑️ Eliminar una receta específica
router.delete('/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la receta existe
    const [recipe] = await pool.execute(
      'SELECT id FROM recipes WHERE id = ?', 
      [id]
    );
    
    if (recipe.length === 0) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    // Eliminar receta (los comentarios se eliminan en cascada)
    await pool.execute('DELETE FROM recipes WHERE id = ?', [id]);
    
    res.json({ message: 'Receta eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando receta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;