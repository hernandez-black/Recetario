const pool = require('../config/database');

// Función para validar ID (numérico o UUID)
const isValidCommentId = (id) => {
  if (!id) return false;
  
  const idStr = String(id).trim();
  
  // Validar UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(idStr)) return true;
  
  // Validar ID numérico (para auto-increment)
  const numericRegex = /^\d+$/;
  if (numericRegex.test(idStr) && parseInt(idStr) > 0) return true;
  
  return false;
};

// Función para detectar y bloquear links, fotos, videos y archivos
const containsBlockedContent = (text) => {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  // Patrones para detectar URLs y links
  const urlPatterns = [
    /https?:\/\//i,
    /www\./i,
    /\.[a-z]{2,}\//i,
    /(?:ftp|file):\/\//i,
    /bit\.ly\//i,
    /goo\.gl\//i,
    /tinyurl\.com\//i,
    /ow\.ly\//i,
    /is\.gd\//i,
    /buff\.ly\//i,
    /shorturl\.at\//i,
  ];
  
  // Patrones para detectar extensiones de archivos
  const fileExtensions = [
    /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)/i,
    /\.(mp4|avi|mov|wmv|flv|mkv|webm|mpg|mpeg)/i,
    /\.(mp3|wav|ogg|flac|aac|m4a)/i,
    /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)/i,
    /\.(zip|rar|7z|tar|gz|bz2)/i,
    /\.(exe|msi|bat|sh|cmd|ps1)/i,
    /\.(apk|ipa|dmg|pkg)/i,
  ];
  
  // Patrones para detectar archivos adjuntos
  const attachmentPatterns = [
    /archivo|adjunto|descargar|download/i,
    /file|attachment|upload/i,
    /drive\.google\.com/i,
    /dropbox\.com/i,
    /onedrive\.live\.com/i,
    /mega\.nz/i,
    /mediafire\.com/i,
  ];
  
  // Verificar cada patrón
  for (const pattern of urlPatterns) {
    if (pattern.test(lowerText)) return true;
  }
  
  for (const pattern of fileExtensions) {
    if (pattern.test(lowerText)) return true;
  }
  
  for (const pattern of attachmentPatterns) {
    if (pattern.test(lowerText)) return true;
  }
  
  // Verificar si hay algún enlace con formato [texto](url)
  if (/\[.*?\]\(.*?\)/.test(text)) return true;
  
  // Verificar si hay algún enlace con formato <a href=
  if (/<a\s+href=/i.test(text)) return true;
  
  return false;
};

// Función para sanitizar contenido
const sanitizeContent = (content) => {
  if (!content) return '';
  
  let sanitized = content
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  // Eliminar URLs
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/gi, '');
  sanitized = sanitized.replace(/www\.[^\s]+/gi, '');
  
  // Eliminar extensiones de archivos
  sanitized = sanitized.replace(/\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|mp4|avi|mov|mp3|pdf|doc|zip)\b/gi, '');
  
  return sanitized.trim();
};

// Validar contenido del comentario
const validateContent = (content) => {
  if (!content) {
    return { isValid: false, message: 'El contenido del comentario es requerido' };
  }
  
  const trimmedContent = content.trim();
  
  if (trimmedContent.length === 0) {
    return { isValid: false, message: 'El comentario no puede estar vacío' };
  }
  
  if (trimmedContent.length < 3) {
    return { isValid: false, message: 'El comentario debe tener al menos 3 caracteres' };
  }
  
  if (trimmedContent.length > 500) {
    return { isValid: false, message: 'El comentario no puede exceder los 500 caracteres' };
  }
  
  if (/^\s+$/.test(content)) {
    return { isValid: false, message: 'El comentario no puede contener solo espacios' };
  }
  
  // BLOQUEAR CONTENIDO CON LINKS, FOTOS, VIDEOS O ARCHIVOS
  if (containsBlockedContent(content)) {
    return { 
      isValid: false, 
      message: 'No está permitido compartir links, fotos, videos o archivos en los comentarios' 
    };
  }
  
  return { isValid: true, message: 'Contenido válido', cleanedContent: trimmedContent };
};

// Validar recipe_id
const validateRecipeId = (recipe_id) => {
  if (!recipe_id) {
    return { isValid: false, message: 'ID de receta no proporcionado' };
  }
  
  const idStr = String(recipe_id).trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const numericRegex = /^\d+$/;
  
  if (uuidRegex.test(idStr) || numericRegex.test(idStr)) {
    return { isValid: true, message: 'ID válido' };
  }
  
  return { isValid: false, message: 'ID de receta no válido' };
};

const addComment = async (req, res) => {
  try {
    const { recipe_id } = req.params;
    let { content } = req.body;

    // Validar recipe_id
    const recipeValidation = validateRecipeId(recipe_id);
    if (!recipeValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        error: recipeValidation.message 
      });
    }

    // Validar usuario autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        error: 'Usuario no autenticado' 
      });
    }

    // Validar contenido
    const contentValidation = validateContent(content);
    if (!contentValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        error: contentValidation.message 
      });
    }

    // Sanitizar contenido
    const sanitizedContent = sanitizeContent(contentValidation.cleanedContent);
    
    if (sanitizedContent.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'El comentario no contiene texto válido' 
      });
    }

    const conn = await pool.getConnection();

    try {
      // Verificar que la receta existe
      const [recipes] = await conn.execute(
        'SELECT id FROM recipes WHERE id = ?',
        [recipe_id]
      );

      if (recipes.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Receta no encontrada' 
        });
      }

      // Insertar comentario (dejar que MySQL genere el ID automáticamente si es auto-increment)
      const [result] = await conn.execute(
        'INSERT INTO comments (recipe_id, user_id, content) VALUES (?, ?, ?)',
        [recipe_id, req.user.id, sanitizedContent]
      );

      // Obtener el comentario recién creado
      const [comments] = await conn.execute(
        `SELECT 
          c.*, 
          u.username,
          DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') as created_at_formatted
        FROM comments c 
        LEFT JOIN users u ON c.user_id = u.id 
        WHERE c.id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Comentario agregado exitosamente',
        comment: comments[0]
      });

    } catch (error) {
      console.error('Error al agregar comentario:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor al agregar comentario' 
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('Error en addComment:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('=== ELIMINAR COMENTARIO ===');
    console.log('ID recibido:', id);
    console.log('Tipo:', typeof id);
    console.log('Usuario:', req.user?.id);

    // Validar ID del comentario
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'ID de comentario no proporcionado' 
      });
    }

    // Validar formato del ID (numérico o UUID)
    if (!isValidCommentId(id)) {
      return res.status(400).json({ 
        success: false,
        error: 'ID de comentario no válido. Debe ser un número o UUID válido.' 
      });
    }

    // Validar usuario autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        error: 'Usuario no autenticado' 
      });
    }

    const conn = await pool.getConnection();

    try {
      // Verificar que el comentario existe y obtener el user_id
      const [comments] = await conn.execute(
        'SELECT id, user_id, content FROM comments WHERE id = ?',
        [id]
      );

      console.log('Comentario encontrado:', comments);

      if (comments.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Comentario no encontrado' 
        });
      }

      const comment = comments[0];

      // Verificar permisos (solo el dueño del comentario puede eliminarlo)
      if (comment.user_id !== req.user.id) {
        return res.status(403).json({ 
          success: false,
          error: 'No tienes permiso para eliminar este comentario. Solo el autor puede eliminarlo.' 
        });
      }

      // Eliminar comentario
      const [result] = await conn.execute(
        'DELETE FROM comments WHERE id = ?',
        [id]
      );

      console.log('Resultado eliminación:', result);

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'No se pudo eliminar el comentario' 
        });
      }

      res.json({ 
        success: true,
        message: 'Comentario eliminado correctamente' 
      });

    } catch (error) {
      console.error('Error en deleteComment - DB:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor al eliminar comentario: ' + error.message
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('Error en deleteComment:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor: ' + error.message
    });
  }
};

// Función para obtener comentarios
const getComments = async (req, res) => {
  try {
    const { recipe_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const recipeValidation = validateRecipeId(recipe_id);
    if (!recipeValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        error: recipeValidation.message 
      });
    }

    const conn = await pool.getConnection();

    try {
      // Obtener total de comentarios
      const [totalResult] = await conn.execute(
        'SELECT COUNT(*) as total FROM comments WHERE recipe_id = ?',
        [recipe_id]
      );

      // Obtener comentarios con paginación
      const [comments] = await conn.execute(
        `SELECT 
          c.*, 
          u.username,
          DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') as created_at_formatted,
          DATE_FORMAT(c.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at_formatted
        FROM comments c 
        LEFT JOIN users u ON c.user_id = u.id 
        WHERE c.recipe_id = ? 
        ORDER BY c.created_at DESC 
        LIMIT ? OFFSET ?`,
        [recipe_id, limit, offset]
      );

      res.json({
        success: true,
        comments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalResult[0].total / limit),
          totalComments: totalResult[0].total,
          limit,
          offset
        }
      });

    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('Error en getComments:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

module.exports = { 
  addComment, 
  deleteComment, 
  getComments 
};