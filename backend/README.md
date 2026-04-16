# 🍳 Recetario API - MySQL Local

API REST para gestionar recetas de cocina con MySQL local. Versión descentralizada de la API original, diseñada para desarrollo local.

## ✨ Características

- 🔐 Autenticación con **JWT**
- 👤 Registro y login de usuarios
- 🍲 CRUD completo de **recetas**
- 💬 Sistema de **comentarios**
- ⭐ Sistema de **favoritos**
- 🖼️ Subida de imágenes para recetas
- 🔒 Protección de rutas privadas
- 💾 Base de datos **MySQL** local

## 📋 Requisitos

- **Node.js** v14+
- **MySQL** 5.7+
- **npm** o **yarn**

## 🚀 Instalación

### 1. Clonar o crear el proyecto

```bash
cd recetario-api-mysql
npm install
```

### 2. Configurar MySQL

Asegúrate de que MySQL esté corriendo. Luego crea la base de datos:

```bash
mysql -u root
```

```sql
CREATE DATABASE recetario;
```

### 3. Crear archivo `.env`

Copia el archivo `.env.example` y crea `.env`:

```bash
cp .env.example .env
```

Configura las variables según tu entorno MySQL:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=recetario
DB_PORT=3306

PORT=3001
JWT_SECRET=tu_secreto_super_seguro_aqui

CORS_ORIGIN=http://localhost:5173
```

### 4. Inicializar la base de datos

```bash
npm run init-db
```

Esto creará todas las tablas necesarias.

### 5. Instalar dependencias

```bash
npm install
```

### 6. Iniciar el servidor

**Desarrollo (con hot-reload):**

```bash
npm run dev
```

**Producción:**

```bash
npm start
```

El servidor estará disponible en: `http://localhost:3001`

---

## 📚 Documentación de Endpoints

### 🔐 Autenticación

#### Registro
```
POST /api/auth/register
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "mipasswordseguro",
  "username": "cocinillas99"
}
```

#### Login
```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "mipasswordseguro"
}
```

**Respuesta:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "username": "cocinillas99"
  }
}
```

---

### 🍲 Recetas

#### Obtener todas las recetas (Público)
```
GET /api/recipes
```

#### Obtener receta por ID (Público)
```
GET /api/recipes/:id
```

#### Crear receta (Privado)
```
POST /api/recipes
Authorization: Bearer TOKEN
Content-Type: multipart/form-data
```

**Body:**
- `title` (string) - Título de la receta
- `description` (string) - Descripción/ingredientes
- `image` (file) - Imagen opcional

#### Actualizar receta (Privado)
```
PATCH /api/recipes/:id
Authorization: Bearer TOKEN
Content-Type: multipart/form-data
```

#### Eliminar receta (Privado)
```
DELETE /api/recipes/:id
Authorization: Bearer TOKEN
```

---

### 💬 Comentarios

#### Agregar comentario (Privado)
```
POST /api/recipes/:recipe_id/comments
Authorization: Bearer TOKEN
```

**Body:**
```json
{
  "content": "¡Qué receta tan deliciosa!"
}
```

#### Eliminar comentario (Privado)
```
DELETE /api/comments/:id
Authorization: Bearer TOKEN
```

---

### ⭐ Favoritos

#### Toggle favorito (Privado)
```
POST /api/recipes/:recipe_id/favorite
Authorization: Bearer TOKEN
```

#### Obtener mis favoritos (Privado)
```
GET /api/favorites
Authorization: Bearer TOKEN
```

---

## 📁 Estructura del Proyecto

```
recetario-api-mysql/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración MySQL
│   ├── controllers/
│   │   ├── authController.js    # Lógica de autenticación
│   │   ├── recipeController.js  # CRUD de recetas
│   │   ├── commentController.js # Gestión de comentarios
│   │   └── favoriteController.js# Gestión de favoritos
│   ├── database/
│   │   └── init.js              # Inicialización de BD
│   ├── middlewares/
│   │   └── authMiddleware.js    # Validación de JWT
│   ├── routes/
│   │   └── api.js               # Rutas principales
│   └── index.js                 # Entrada de la API
├── uploads/                     # Almacenamiento de imágenes
├── .env.example                 # Variables de entorno ejemplo
├── package.json
└── README.md
```

---

## 🔧 Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_USER` | Usuario de MySQL | `root` |
| `DB_PASSWORD` | Contraseña de MySQL | `` |
| `DB_NAME` | Nombre de la BD | `recetario` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `PORT` | Puerto del servidor | `3001` |
| `JWT_SECRET` | Secreto para JWT | Debe estar definido |
| `CORS_ORIGIN` | Origen CORS permitido | `http://localhost:5173` |

---

## 🔒 Autenticación

Todas las rutas marcadas como **Privadas** requieren el envío del token JWT en el header:

```
Authorization: Bearer TU_TOKEN_AQUI
```

El token se obtiene al hacer login y expira en **24 horas**.

---

## ⚙️ Troubleshooting

### Error de conexión a MySQL
- Verifica que MySQL esté corriendo
- Revisa credenciales en `.env`
- Asegurate que la BD `recetario` existe

### Error "JWT_SECRET no definido"
- Configura la variable `JWT_SECRET` en `.env`

### Imágenes no se guardan
- Verifica permisos de escritura en la carpeta `uploads/`

---

## 📝 Notas

- Las imágenes se guardan en la carpeta `uploads/`
- Los tokens JWT expiran en 24 horas
- Para actualizar solo ciertos campos, solo envía los que quieras cambiar
- Los favoritos son únicos por usuario y receta

---

## 📄 Licencia

ISC
