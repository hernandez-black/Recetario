require('dotenv').config();
const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dns = require('dns').promises;
const axios = require('axios');

// Lista de dominios temporales/desechables comunes
const disposableDomains = [
  'tempmail.com', 'throwaway.com', 'guerrillamail.com', 'mailinator.com',
  '10minutemail.com', 'yopmail.com', 'temp-mail.org', 'fakeinbox.com',
  'getnada.com', 'mailnator.com', 'trashmail.com', 'spam4.me',
  'dispostable.com', 'maildrop.cc', 'guerrillamail.org', 'sharklasers.com'
];

// Lista de TLDs válidos (comunes)
const validTLDs = [
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'io', 'co', 'uk', 'us', 'ca', 'au',
  'de', 'fr', 'es', 'it', 'nl', 'br', 'mx', 'jp', 'cn', 'in', 'ru', 'za', 'ar',
  'cl', 'pe', 've', 'ec', 'gt', 'cr', 'pa', 'do', 'uy', 'bo', 'py', 'hn', 'sv',
  'ni', 'pr', 'cu', 'name', 'biz', 'info', 'tv', 'me', 'cc', 'xyz', 'online',
  'site', 'tech', 'store', 'blog', 'cloud', 'app', 'dev', 'work', 'agency'
];

// Función para verificar si el dominio existe (tiene registros MX o A)
const verifyDomainExists = async (domain) => {
  try {
    // Intentar obtener registros MX
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      return { exists: true, hasMX: true, records: mxRecords };
    }
    
    // Si no hay MX, intentar con registros A
    const aRecords = await dns.resolve4(domain);
    if (aRecords && aRecords.length > 0) {
      return { exists: true, hasMX: false, hasA: true, records: aRecords };
    }
    
    return { exists: false, message: 'El dominio no tiene registros MX o A' };
  } catch (error) {
    return { exists: false, message: 'El dominio no existe o no está configurado correctamente' };
  }
};

// Función para verificar si el email es de dominio temporal/desechable
const isDisposableEmail = (domain) => {
  return disposableDomains.some(disposable => domain.includes(disposable));
};

// Función para validar TLD
const isValidTLD = (tld) => {
  return validTLDs.includes(tld.toLowerCase());
};

// Función mejorada de validación de email
const validateEmail = async (email, checkDomain = true) => {
  // Eliminar espacios en blanco al inicio y final
  email = email.trim().toLowerCase();
  
  // Validación básica de formato
  if (!email) {
    return { isValid: false, message: 'El email es requerido' };
  }
  
  if (email.length > 254) {
    return { isValid: false, message: 'El email es demasiado largo (máximo 254 caracteres)' };
  }
  
  // Regex más estricto para email
  const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Formato de email inválido. Ejemplo: usuario@dominio.com' };
  }
  
  // Validar que no haya dos puntos consecutivos
  if (email.includes('..')) {
    return { isValid: false, message: 'El email no puede contener puntos consecutivos' };
  }
  
  // Validar parte local (antes del @)
  const [localPart, domain] = email.split('@');
  
  if (localPart.length > 64) {
    return { isValid: false, message: 'La parte local del email es demasiado larga (máximo 64 caracteres)' };
  }
  
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, message: 'El email no puede comenzar o terminar con punto' };
  }
  
  // Validar que no haya caracteres especiales consecutivos
  if (/[._-]{2,}/.test(localPart)) {
    return { isValid: false, message: 'El email no puede tener caracteres especiales consecutivos' };
  }
  
  // Validar dominio
  if (domain.length > 255) {
    return { isValid: false, message: 'El dominio del email es demasiado largo' };
  }
  
  if (!domain.includes('.')) {
    return { isValid: false, message: 'El dominio debe contener un punto' };
  }
  
  // Validar TLD
  const tld = domain.split('.').pop();
  if (!isValidTLD(tld)) {
    return { 
      isValid: false, 
      message: `Extensión de dominio '${tld}' no válida. Usa extensiones comunes como .com, .org, .net, etc.` 
    };
  }
  
  // Validar que el dominio no tenga caracteres inválidos
  if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(domain)) {
    return { isValid: false, message: 'El dominio contiene caracteres inválidos' };
  }
  
  // Validar que no haya guiones al inicio o final del dominio
  if (domain.startsWith('-') || domain.endsWith('-')) {
    return { isValid: false, message: 'El dominio no puede comenzar o terminar con guión' };
  }
  
  // Verificar si es email temporal/desechable
  if (isDisposableEmail(domain)) {
    return { 
      isValid: false, 
      message: 'No se permiten emails temporales o desechables. Usa un email permanente.' 
    };
  }
  
  // Verificar existencia del dominio (opcional, puede ser lento)
  if (checkDomain) {
    try {
      const domainExists = await verifyDomainExists(domain);
      if (!domainExists.exists) {
        return { 
          isValid: false, 
          message: `El dominio '${domain}' no existe o no está configurado correctamente. Verifica la dirección de email.` 
        };
      }
    } catch (error) {
      console.error('Error verificando dominio:', error);
      // Si hay error en la verificación DNS, permitimos el email pero advertimos
      return { 
        isValid: true, 
        message: 'Email válido (no se pudo verificar el dominio automáticamente)',
        warning: true
      };
    }
  }
  
  return { isValid: true, message: 'Email válido' };
};

// Función para validar email con verificación SMTP (más avanzado)
const verifyEmailSMTP = async (email) => {
  // Esta función requiere configuración adicional de servidor SMTP
  // Es más compleja y puede no ser necesaria para todos los casos
  return { isValid: true, message: 'Verificación SMTP no implementada' };
};

// Función de validación de contraseña mejorada
const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'La contraseña es requerida' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'La contraseña debe tener mínimo 8 caracteres' };
  }
  
  if (password.length > 100) {
    return { isValid: false, message: 'La contraseña es demasiado larga (máximo 100 caracteres)' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*#?&]/.test(password);
  
  if (!hasUpperCase && !hasLowerCase && !hasNumber && !hasSpecial) {
    return { 
      isValid: false, 
      message: 'La contraseña debe contener al menos letras, números o caracteres especiales (@$!%*#?&)' 
    };
  }
  
  // Verificar que no tenga espacios
  if (/\s/.test(password)) {
    return { isValid: false, message: 'La contraseña no puede contener espacios' };
  }
  
  return { isValid: true, message: 'Contraseña válida', strength: getPasswordStrength(password) };
};

// Función para evaluar fortaleza de contraseña
const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*#?&]/.test(password)) score++;
  
  if (score >= 4) return 'fuerte';
  if (score >= 2) return 'media';
  return 'débil';
};

// Función de validación de username
const validateUsername = (username) => {
  if (!username) {
    return { isValid: false, message: 'El nombre de usuario es requerido' };
  }
  
  if (username.length < 3) {
    return { isValid: false, message: 'El nombre de usuario debe tener mínimo 3 caracteres' };
  }
  
  if (username.length > 30) {
    return { isValid: false, message: 'El nombre de usuario debe tener máximo 30 caracteres' };
  }
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { 
      isValid: false, 
      message: 'El nombre de usuario solo puede contener letras, números y guión bajo' 
    };
  }
  
  // Verificar que no comience con número
  if (/^[0-9]/.test(username)) {
    return { isValid: false, message: 'El nombre de usuario no puede comenzar con un número' };
  }
  
  // Verificar palabras reservadas
  const reservedWords = ['admin', 'root', 'system', 'user', 'test', 'prueba'];
  if (reservedWords.includes(username.toLowerCase())) {
    return { isValid: false, message: 'El nombre de usuario no está disponible' };
  }
  
  return { isValid: true, message: 'Username válido' };
};

const register = async (req, res) => {
  let email = req.body.email;
  const { password, username } = req.body;
  
  // Limpiar email (trim y lowercase)
  if (email) {
    email = email.trim().toLowerCase();
  }

  try {
    // Validaciones (con verificación de dominio)
    const emailValidation = await validateEmail(email, true);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        error: emailValidation.message 
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        error: passwordValidation.message 
      });
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        error: usernameValidation.message 
      });
    }

    const conn = await pool.getConnection();

    // Verificar si el usuario ya existe
    const [existingUsers] = await conn.execute(
      'SELECT id, email, username FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      conn.release();
      
      const existingEmail = existingUsers.some(user => user.email === email);
      const existingUsername = existingUsers.some(user => user.username === username);
      
      if (existingEmail && existingUsername) {
        return res.status(400).json({ 
          success: false,
          error: 'El email y el nombre de usuario ya están registrados' 
        });
      } else if (existingEmail) {
        return res.status(400).json({ 
          success: false,
          error: 'Este email ya está registrado. Por favor, utiliza otro o inicia sesión' 
        });
      } else {
        return res.status(400).json({ 
          success: false,
          error: 'Este nombre de usuario ya está registrado. Por favor, elige otro' 
        });
      }
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const [result] = await conn.execute(
  'INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)',
  [email, username, hashedPassword, 'user']
);

    conn.release();

    res.status(201).json({
      success: true,
      message: '¡Usuario registrado exitosamente!',
      user: { id: result.insertId, email, username, role: 'user' }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor. Por favor, intenta más tarde.' 
    });
  }
};

const login = async (req, res) => {
  let email = req.body.email;
  const { password } = req.body;
  
  // Limpiar email
  if (email) {
    email = email.trim().toLowerCase();
  }

  // Validaciones
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      error: 'Email y contraseña son requeridos' 
    });
  }

  const emailValidation = await validateEmail(email, false); // No verificar dominio en login por velocidad
  if (!emailValidation.isValid) {
    return res.status(400).json({ 
      success: false,
      error: emailValidation.message 
    });
  }

  try {
    const conn = await pool.getConnection();

    const [users] = await conn.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    conn.release();

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'Email o contraseña incorrectos' 
      });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false,
        error: 'Email o contraseña incorrectos' 
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        username: user.username,
        role: user.role,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET || 'secret_key_default_change_this',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: '¡Login exitoso!',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor. Por favor, intenta más tarde.' 
    });
  }
};

// Endpoint para verificar email sin registrar
const verifyEmail = async (req, res) => {
  const { email } = req.body;
  const validation = await validateEmail(email, true);
  
  res.json({
    isValid: validation.isValid,
    message: validation.message,
    warning: validation.warning || false
  });
};

module.exports = { register, login, verifyEmail, validateEmail };