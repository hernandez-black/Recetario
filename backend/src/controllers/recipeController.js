require('dotenv').config();
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para guardar imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

// Función para detectar y bloquear links, fotos, videos y archivos
const containsBlockedContent = (text) => {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  // Patrones para detectar URLs y links
  const urlPatterns = [
    /https?:\/\//i,           // http:// o https://
    /www\./i,                  // www.
    /\.[a-z]{2,}\//i,         // dominio.com/
    /(?:ftp|file):\/\//i,     // ftp:// o file://
    /bit\.ly\//i,             // acortadores
    /goo\.gl\//i,
    /tinyurl\.com\//i,
    /ow\.ly\//i,
    /is\.gd\//i,
    /buff\.ly\//i,
    /shorturl\.at\//i,
  ];
  
  // Patrones para detectar extensiones de archivos
  const fileExtensions = [
    /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)/i,     // Imágenes
    /\.(mp4|avi|mov|wmv|flv|mkv|webm|mpg|mpeg)/i, // Videos
    /\.(mp3|wav|ogg|flac|aac|m4a)/i,              // Audios
    /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)/i,        // Documentos
    /\.(zip|rar|7z|tar|gz|bz2)/i,                 // Comprimidos
    /\.(exe|msi|bat|sh|cmd|ps1)/i,                // Ejecutables
    /\.(apk|ipa|dmg|pkg)/i,                       // Aplicaciones
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
  
  // Patrones para detectar redes sociales
  const socialMediaPatterns = [
    /facebook\.com/i,
    /twitter\.com/i,
    /instagram\.com/i,
    /youtube\.com/i,
    /youtu\.be/i,
    /tiktok\.com/i,
    /whatsapp\.com/i,
    /telegram\.org/i,
    /discord\.com/i,
    /linkedin\.com/i,
    /pinterest\.com/i,
    /tumblr\.com/i,
    /flickr\.com/i,
  ];
  
  // Patrones para detectar código HTML/iframe
  const htmlPatterns = [
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /<script/i,
    /<img\s+src=/i,
    /<video/i,
    /<audio/i,
    /<source/i,
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
  
  for (const pattern of socialMediaPatterns) {
    if (pattern.test(lowerText)) return true;
  }
  
  for (const pattern of htmlPatterns) {
    if (pattern.test(text)) return true;
  }
  
  // Verificar si hay algún enlace con formato [texto](url)
  if (/\[.*?\]\(.*?\)/.test(text)) return true;
  
  // Verificar si hay algún enlace con formato <a href=
  if (/<a\s+href=/i.test(text)) return true;
  
  // Verificar si hay algún correo electrónico
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) return true;
  
  return false;
};

// Función para sanitizar contenido (eliminar links)
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
  
  // Eliminar correos electrónicos
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
  
  // Eliminar extensiones de archivos
  sanitized = sanitized.replace(/\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|mp4|avi|mov|mp3|pdf|doc|zip)\b/gi, '');
  
  // Eliminar menciones de redes sociales
  sanitized = sanitized.replace(/@[a-zA-Z0-9_]+/g, '');
  
  return sanitized.trim();
};

// Función para validar título
const validateTitle = (title) => {
  if (!title) {
    return { isValid: false, message: 'El título es requerido' };
  }
  
  const trimmedTitle = title.trim();
  
  if (trimmedTitle.length === 0) {
    return { isValid: false, message: 'El título no puede estar vacío' };
  }
  
  if (trimmedTitle.length < 3) {
    return { isValid: false, message: 'El título debe tener al menos 3 caracteres' };
  }
  
  if (trimmedTitle.length > 200) {
    return { isValid: false, message: 'El título no puede exceder los 200 caracteres' };
  }
  
  if (/^\s+$/.test(title)) {
    return { isValid: false, message: 'El título no puede contener solo espacios' };
  }
  
  // BLOQUEAR LINKS, IMAGENES, VIDEOS EN TÍTULO
  if (containsBlockedContent(title)) {
    return { 
      isValid: false, 
      message: 'El título no puede contener links, imágenes, videos o archivos' 
    };
  }
  
  return { isValid: true, message: 'Título válido', cleanedTitle: trimmedTitle };
};

// Función para validar descripción
const validateDescription = (description) => {
  if (!description) {
    return { isValid: false, message: 'La descripción es requerida' };
  }
  
  const trimmedDesc = description.trim();
  
  if (trimmedDesc.length === 0) {
    return { isValid: false, message: 'La descripción no puede estar vacía' };
  }
  
  if (trimmedDesc.length < 10) {
    return { isValid: false, message: 'La descripción debe tener al menos 10 caracteres' };
  }
  
  if (trimmedDesc.length > 2000) {
    return { isValid: false, message: 'La descripción no puede exceder los 2000 caracteres' };
  }
  
  if (/^\s+$/.test(description)) {
    return { isValid: false, message: 'La descripción no puede contener solo espacios' };
  }
  
  // BLOQUEAR LINKS, IMAGENES, VIDEOS EN DESCRIPCIÓN
  if (containsBlockedContent(description)) {
    return { 
      isValid: false, 
      message: 'La descripción no puede contener links, imágenes, videos o archivos' 
    };
  }
  
  return { isValid: true, message: 'Descripción válida', cleanedDesc: trimmedDesc };
};

// Función para validar ID
const isValidId = (id) => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const numericRegex = /^\d+$/;
  return uuidRegex.test(id) || numericRegex.test(id);
};

const getAllRecipes = async (req, res) => {
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
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN comments c ON r.id = c.recipe_id
      LEFT JOIN users cu ON c.user_id = cu.id
      ORDER BY r.created_at DESC, c.created_at ASC
    `);

    conn.release();

    const recipesMap = new Map();
    for (const row of rows) {
      if (!recipesMap.has(row.id)) {
        recipesMap.set(row.id, {
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
        recipesMap.get(row.id).comments.push({
          id: row.comment_id,
          content: row.comment_content,
          user_id: row.comment_user_id,
          username: row.comment_username,
          created_at: row.comment_created_at
        });
      }
    }

    res.json(Array.from(recipesMap.values()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !isValidId(id)) {
      return res.status(400).json({ error: 'ID de receta no válido' });
    }
    
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
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN comments c ON r.id = c.recipe_id
      LEFT JOIN users cu ON c.user_id = cu.id
      WHERE r.id = ?
      ORDER BY c.created_at ASC
    `, [id]);

    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    const recipe = {
      id: rows[0].id,
      user_id: rows[0].user_id,
      title: rows[0].title,
      description: rows[0].description,
      image_url: rows[0].image_url,
      created_at: rows[0].created_at,
      updated_at: rows[0].updated_at,
      username: rows[0].username,
      comments: []
    };

    for (const row of rows) {
      if (row.comment_id) {
        recipe.comments.push({
          id: row.comment_id,
          content: row.comment_content,
          user_id: row.comment_user_id,
          username: row.comment_username,
          created_at: row.comment_created_at
        });
      }
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createRecipe = async (req, res) => {
  const { title, description } = req.body;
  const file = req.file;

  // Validar título
  const titleValidation = validateTitle(title);
  if (!titleValidation.isValid) {
    if (file) {
      fs.unlinkSync(file.path);
    }
    return res.status(400).json({ error: titleValidation.message });
  }

  // Validar descripción
  const descValidation = validateDescription(description);
  if (!descValidation.isValid) {
    if (file) {
      fs.unlinkSync(file.path);
    }
    return res.status(400).json({ error: descValidation.message });
  }

  // Sanitizar contenido (eliminar cualquier link que haya pasado)
  const sanitizedTitle = sanitizeContent(titleValidation.cleanedTitle);
  const sanitizedDesc = sanitizeContent(descValidation.cleanedDesc);

  try {
    const conn = await pool.getConnection();

    let image_url = null;
    if (file) {
      image_url = `/uploads/${file.filename}`;
    }

    const [result] = await conn.execute(
      'INSERT INTO recipes (id, user_id, title, description, image_url) VALUES (UUID(), ?, ?, ?, ?)',
      [req.user.id, sanitizedTitle, sanitizedDesc, image_url]
    );

    const [recipes] = await conn.execute(
      'SELECT * FROM recipes WHERE id = ?',
      [result.insertId]
    );

    conn.release();

    res.status(201).json(recipes[0]);
  } catch (error) {
    if (file) {
      fs.unlinkSync(file.path);
    }
    res.status(400).json({ error: error.message });
  }
};

const updateRecipe = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const file = req.file;

  if (!id || !isValidId(id)) {
    if (file) fs.unlinkSync(file.path);
    return res.status(400).json({ error: 'ID de receta no válido' });
  }

  try {
    const conn = await pool.getConnection();

    const [recipes] = await conn.execute(
      'SELECT * FROM recipes WHERE id = ?',
      [id]
    );

    if (recipes.length === 0) {
      if (file) fs.unlinkSync(file.path);
      conn.release();
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    if (recipes[0].user_id !== req.user.id) {
      if (file) fs.unlinkSync(file.path);
      conn.release();
      return res.status(403).json({ error: 'No autorizado' });
    }

    let cleanedTitle = recipes[0].title;
    if (title !== undefined) {
      const titleValidation = validateTitle(title);
      if (!titleValidation.isValid) {
        if (file) fs.unlinkSync(file.path);
        conn.release();
        return res.status(400).json({ error: titleValidation.message });
      }
      cleanedTitle = sanitizeContent(titleValidation.cleanedTitle);
    }

    let cleanedDesc = recipes[0].description;
    if (description !== undefined) {
      const descValidation = validateDescription(description);
      if (!descValidation.isValid) {
        if (file) fs.unlinkSync(file.path);
        conn.release();
        return res.status(400).json({ error: descValidation.message });
      }
      cleanedDesc = sanitizeContent(descValidation.cleanedDesc);
    }

    let image_url = recipes[0].image_url;
    if (file) {
      if (recipes[0].image_url) {
        const oldPath = path.join(__dirname, '../../' + recipes[0].image_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      image_url = `/uploads/${file.filename}`;
    }

    await conn.execute(
      'UPDATE recipes SET title = ?, description = ?, image_url = ?, updated_at = NOW() WHERE id = ?',
      [cleanedTitle, cleanedDesc, image_url, id]
    );

    const [updatedRecipes] = await conn.execute(
      'SELECT * FROM recipes WHERE id = ?',
      [id]
    );

    conn.release();

    res.json(updatedRecipes[0]);
  } catch (error) {
    if (file) fs.unlinkSync(file.path);
    res.status(400).json({ error: error.message });
  }
};

const deleteRecipe = async (req, res) => {
  const { id } = req.params;

  if (!id || !isValidId(id)) {
    return res.status(400).json({ error: 'ID de receta no válido' });
  }

  try {
    const conn = await pool.getConnection();

    const [recipes] = await conn.execute(
      'SELECT * FROM recipes WHERE id = ?',
      [id]
    );

    if (recipes.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    if (recipes[0].user_id !== req.user.id) {
      conn.release();
      return res.status(403).json({ error: 'No autorizado' });
    }

    if (recipes[0].image_url) {
      const imagePath = path.join(__dirname, '../../' + recipes[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await conn.execute('DELETE FROM recipes WHERE id = ?', [id]);

    conn.release();

    res.json({ message: 'Receta eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { 
  getAllRecipes, 
  getRecipeById, 
  createRecipe, 
  updateRecipe, 
  deleteRecipe, 
  upload 
};