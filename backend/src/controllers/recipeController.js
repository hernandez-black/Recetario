require('dotenv').config();
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Configuración de cliente R2
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Configurar multer para guardar imágenes en memoria (para subirlas directo a R2)
const storage = multer.memoryStorage();

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

// Función para validar contenido con Azure Content Safety
const validateWithAzureSafety = async (text, imagePath) => {
  const endpoint = process.env.AZURE_CONTENT_SAFETY_ENDPOINT;
  const key = process.env.AZURE_CONTENT_SAFETY_KEY;

  if (!endpoint || !key) {
    console.warn('Azure Content Safety no configurado. Saltando validación de IA.');
    return { isSafe: true };
  }

  const endpointUrl = endpoint.endsWith('/') ? endpoint : endpoint + '/';

  const headers = {
    'Ocp-Apim-Subscription-Key': key,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Validar Texto
    if (text) {
      const textResponse = await axios.post(
        `${endpointUrl}contentsafety/text:analyze?api-version=2023-10-01`,
        { text },
        { headers }
      );
      
      const textCategories = textResponse.data.categoriesAnalysis;
      const isTextUnsafe = textCategories.some(cat => cat.severity > 0);
      if (isTextUnsafe) {
        return { isSafe: false, message: 'El texto contiene contenido inapropiado, ofensivo o inseguro.' };
      }
    }

    // 2. Validar Imagen
    if (imageBuffer) {
      const base64Image = imageBuffer.toString('base64');
      
      const imageResponse = await axios.post(
        `${endpointUrl}contentsafety/image:analyze?api-version=2023-10-01`,
        { image: { content: base64Image } },
        { headers }
      );
      
      const imageCategories = imageResponse.data.categoriesAnalysis;
      const isImageUnsafe = imageCategories.some(cat => cat.severity > 0);
      if (isImageUnsafe) {
        return { isSafe: false, message: 'La imagen contiene contenido inapropiado, ofensivo, sexual o violento.' };
      }
    }

    return { isSafe: true };
  } catch (error) {
    console.error('Error al validar con Azure Content Safety:', error?.response?.data || error?.message);
    return { isSafe: false, message: 'Ha ocurrido un error al verificar la seguridad del contenido subido.' };
  }
};

// Función auxiliar para subir buffer a R2
const uploadBufferToR2 = async (buffer, mimetype, originalname) => {
  if (!buffer) return null;
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(originalname);
  const filename = `${uniqueSuffix}${ext}`;
  
  const uploadParams = {
    Bucket: process.env.R2_BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    return `${process.env.R2_PUBLIC_URL}/${filename}`;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw error;
  }
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
  // 🔀 COMBINAMOS: tus tags + los campos de tu compañero
  const { title, description, tags, diners, cook_time, ingredients: ingredientsStr, steps: stepsStr } = req.body;

  let selectedTags = [];
if (tags) {
  try {
    selectedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
  } catch (e) {
    console.warn('Error parseando tags:', e);
  }
}
  
  // Usamos el enfoque de tu compañero para archivos (más robusto)
  const files = req.files || [];
  const mainImageFile = files.find(f => f.fieldname === 'image');

  // Validación de imagen (de tu compañero)
  if (!mainImageFile) {
    return res.status(400).json({ error: 'La foto principal de la receta es obligatoria.' });
  }

  // Validar título (tu validación)
  const titleValidation = validateTitle(title);
  if (!titleValidation.isValid) {
    return res.status(400).json({ error: titleValidation.message });
  }

  // Validar descripción (tu validación)
  const descValidation = validateDescription(description);
  if (!descValidation.isValid) {
    return res.status(400).json({ error: descValidation.message });
  }

  // Sanitizar contenido (tu función)
  const sanitizedTitle = sanitizeContent(titleValidation.cleanedTitle);
  const sanitizedDesc = sanitizeContent(descValidation.cleanedDesc);

  // Parsear ingredientes y pasos (lógica de tu compañero, mejorada)
  let ingredients = [];
  try { ingredients = ingredientsStr ? JSON.parse(ingredientsStr) : []; } 
  catch (e) { return res.status(400).json({ error: 'Formato de ingredientes inválido' }); }

  let steps = [];
  try { steps = stepsStr ? JSON.parse(stepsStr) : []; } 
  catch (e) { return res.status(400).json({ error: 'Formato de pasos inválido' }); }

  try {
    // Subir la imagen principal a R2
    const image_url = await uploadBufferToR2(mainImageFile.buffer, mainImageFile.mimetype, mainImageFile.originalname);

    // Procesar imágenes de los pasos y subirlas a R2
    const finalSteps = [];
    for (let idx = 0; idx < steps.length; idx++) {
      const step = steps[idx];
      const stepImgFile = files.find(f => f.fieldname === `step_image_${idx}`);
      let step_image_url = step.image_url || null; // preservar URL si hubiese
      
      if (stepImgFile) {
        step_image_url = await uploadBufferToR2(stepImgFile.buffer, stepImgFile.mimetype, stepImgFile.originalname);
      }
      finalSteps.push({ ...step, image_url: step_image_url });
    }

    const conn = await pool.getConnection();

    // 🔴 IMPORTANTE: Usar INSERT sin UUID() y sin 'id', porque tu BD usa INT AUTO_INCREMENT
    const [result] = await conn.execute(
      `INSERT INTO recipes (
        user_id, title, description, image_url, 
        ingredients, steps, diners, cook_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, 
        sanitizedTitle, 
        sanitizedDesc, 
        image_url,
        JSON.stringify(ingredients),  // Guardar como JSON string
        JSON.stringify(finalSteps),   // Pasos ya resueltos con imágenes R2
        diners || null, 
        cook_time || null
      ]
    );

    // ✅ Obtener el ID generado automáticamente por MySQL (INT)
    const recipeId = result.insertId;

    

    // 🏷️ TU APORTE: Guardar etiquetas si existen
    if (selectedTags && Array.isArray(selectedTags) && selectedTags.length > 0) {
  for (const tagId of selectedTags) {
    await conn.execute(
      'INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)',
      [recipeId, tagId]
    );
  }
}

    conn.release();

    res.status(201).json({ 
      message: 'Receta creada exitosamente',
      recipeId 
    });

  } catch (error) {
    console.error('Error creando receta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const updateRecipe = async (req, res) => {
  const { id } = req.params;
  const { title, description, tags, diners, cook_time, ingredients: ingredientsStr, steps: stepsStr } = req.body;
  const files = req.files || [];
  const mainImageFile = files.find(f => f.fieldname === 'image') || req.file;

  if (!id || !isValidId(id)) {
    return res.status(400).json({ error: 'ID de receta no válido' });
  }

  // Parsear campos complejos
  let selectedTags = [];
  if (tags) {
    try { selectedTags = typeof tags === 'string' ? JSON.parse(tags) : tags; } catch (e) {}
  }
  let ingredients = null;
  if (ingredientsStr) {
    try { ingredients = JSON.parse(ingredientsStr); } catch (e) { return res.status(400).json({ error: 'Formato de ingredientes inválido' }); }
  }
  let steps = null;
  if (stepsStr) {
    try { steps = JSON.parse(stepsStr); } catch (e) { return res.status(400).json({ error: 'Formato de pasos inválido' }); }
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
    if (mainImageFile) {
      // Subir nueva imagen a R2 (sin borrar la vieja de momento, por seguridad en nube compartida o si es la default)
      image_url = await uploadBufferToR2(mainImageFile.buffer, mainImageFile.mimetype, mainImageFile.originalname);
    }

    // Validar con Azure Content Safety (sólo lo que haya cambiado o todo)
    const textToValidate = `${cleanedTitle} \n ${cleanedDesc}`;
    const safetyCheck = await validateWithAzureSafety(textToValidate, mainImageFile ? mainImageFile.buffer : null);
    if (!safetyCheck.isSafe) {
      conn.release();
      return res.status(400).json({ error: safetyCheck.message });
    }
    
    // Procesar imágenes de los pasos (si enviaron) y subirlas a R2
    let finalStepsArray = steps;
    if (steps && Array.isArray(steps)) {
      finalStepsArray = [];
      for (let idx = 0; idx < steps.length; idx++) {
        const step = steps[idx];
        const stepImgFile = files.find(f => f.fieldname === `step_image_${idx}`);
        let step_image_url = step.image_url || null; // preservar URL previa
        
        if (stepImgFile) {
          step_image_url = await uploadBufferToR2(stepImgFile.buffer, stepImgFile.mimetype, stepImgFile.originalname);
        }
        finalStepsArray.push({ ...step, image_url: step_image_url });
      }
    }

    // Preparar campos para actualizar (preservar existentes si no se pasaron)
    const finalIngredients = ingredients !== null ? JSON.stringify(ingredients) : recipes[0].ingredients;
    const finalSteps = finalStepsArray !== null ? JSON.stringify(finalStepsArray) : recipes[0].steps;
    const finalDiners = diners !== undefined ? (diners || null) : recipes[0].diners;
    const finalCookTime = cook_time !== undefined ? (cook_time || null) : recipes[0].cook_time;

    await conn.execute(
      `UPDATE recipes SET 
       title = ?, description = ?, image_url = ?, updated_at = NOW(),
       ingredients = ?, steps = ?, diners = ?, cook_time = ?
       WHERE id = ?`,
      [cleanedTitle, cleanedDesc, image_url, finalIngredients, finalSteps, finalDiners, finalCookTime, id]
    );
    
    // Si pasaron tags, actualizarlas
    if (tags) {
      await conn.execute('DELETE FROM recipe_tags WHERE recipe_id = ?', [id]);
      if (selectedTags && Array.isArray(selectedTags) && selectedTags.length > 0) {
        for (const tagId of selectedTags) {
          await conn.execute(
            'INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)',
            [id, tagId]
          );
        }
      }
    }

    const [updatedRecipes] = await conn.execute(
      'SELECT * FROM recipes WHERE id = ?',
      [id]
    );

    conn.release();

    res.json(updatedRecipes[0]);
  } catch (error) {
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

// Definir como función constante local (sin 'exports.')
const getAllTags = async (req, res) => {
  try {
    const [tags] = await pool.execute('SELECT id, name, color FROM tags ORDER BY name ASC');
    res.json({ tags });
  } catch (error) {
    console.error('Error obteniendo tags:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { 
  getAllRecipes, 
  getRecipeById, 
  createRecipe, 
  updateRecipe, 
  deleteRecipe, 
  getAllTags,
  upload
};