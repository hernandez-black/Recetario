const pool = require('../config/database');

// 📋 Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// 👁️ Obtener recetas de un usuario específico
exports.getUserRecipes = async (req, res) => {
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
      `SELECT r.id, r.title, r.description, r.image_url, r.created_at, r.user_id 
       FROM recipes r 
       WHERE r.user_id = ? 
       ORDER BY r.created_at DESC`,
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
};

// 🗑️ Eliminar un usuario
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir que un admin se elimine a sí mismo
    if (id === req.user.id) {
      return res.status(400).json({ 
        error: 'No puedes eliminar tu propia cuenta de administrador' 
      });
    }

    // Eliminar en cascada (asegúrate de tener FOREIGN KEY con ON DELETE CASCADE)
    // Si no, elimina manualmente: comentarios → recetas → usuario
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// 🗑️ Eliminar una receta específica
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la receta existe
    const [recipe] = await pool.execute(
      'SELECT id, user_id FROM recipes WHERE id = ?', 
      [id]
    );
    
    if (recipe.length === 0) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    // Eliminar receta (los comentarios se eliminan en cascada si está configurado)
    await pool.execute('DELETE FROM recipes WHERE id = ?', [id]);
    
    res.json({ message: 'Receta eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando receta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// 🔄 Cambiar rol de usuario (user ↔ admin)
exports.toggleUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir que un admin se cambie a sí mismo
    if (id === req.user.id) {
      return res.status(400).json({ 
        error: 'No puedes cambiar tu propio rol. Pídele a otro admin que lo haga.' 
      });
    }

    // Obtener el rol actual del usuario
    const [currentUser] = await pool.execute(
      'SELECT role FROM users WHERE id = ?', 
      [id]
    );
    
    if (currentUser.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Alternar el rol
    const newRole = currentUser[0].role === 'admin' ? 'user' : 'admin';
    
    await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?', 
      [newRole, id]
    );

    res.json({ 
      message: `Rol actualizado exitosamente a "${newRole}"`,
      newRole 
    });
  } catch (error) {
    console.error('Error cambiando rol:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};