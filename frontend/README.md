# 🍳 Recetario Web - React + Vite

Frontend moderno para la API Recetario construido con React y Vite.

## 🚀 Inicio Rápido

### 1. Instala dependencias

```bash
cd recetario-web
npm install
```

### 2. Inicia el servidor de desarrollo

```bash
npm run dev
```

Abre: **http://localhost:5173**

### 3. Build para producción

```bash
npm run build
npm run preview
```

---

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── Header.jsx
│   ├── AuthForm.jsx
│   ├── CreateRecipeForm.jsx
│   ├── RecipeCard.jsx
│   ├── RecipeList.jsx
│   ├── RecipeDetail.jsx
│   ├── Notification.jsx
│   └── *.module.css      # Estilos por componente
├── pages/               # Páginas (si se necesita routing)
├── context/             # Context API
│   └── AuthContext.jsx
├── services/            # Llamadas a API
│   └── api.js
├── hooks/               # Custom hooks
│   └── useNotification.js
├── App.jsx             # Componente principal
├── index.css           # Estilos globales
└── main.jsx            # Entrada

public/                 # Archivos estáticos
vite.config.js         # Configuración de Vite
package.json
```

---

## ✨ Características

- ✅ **React 18+** - Framework moderno
- ✅ **Vite** - Build tool ultrarrápido
- ✅ **CSS Modules** - Estilos encapsulados por componente
- ✅ **Context API** - Gestión de estado global
- ✅ **Responsive** - Móvil, tablet y desktop
- ✅ **Modular** - Componentes reutilizables y bien organizados

---

## 🔗 Conexión con API

La aplicación se conecta a la API en `http://localhost:3001/api`

Asegúrate que la API está corriendo:

```bash
cd ../recetario-api-mysql
npm run dev
```

---

## 📝 Funcionalidades

### 🔐 Autenticación
- Registro de nuevos usuarios
- Login con email y contraseña
- Tokens JWT con persistencia
- Logout

### 🍲 Recetas
- Crear nuevas recetas
- Ver todas las recetas (público)
- Ver detalles de receta
- Editar propias recetas
- Eliminar propias recetas
- Subir imágenes

### 💬 Comentarios
- Agregar comentarios
- Ver comentarios de otros
- Eliminar propios comentarios

### ⭐ Favoritos
- Marcar como favorito
- Ver mis favoritos
- Gestión de favoritos

---

## 🎨 Diseño

- UI moderna y colorida
- Modo oscuro ready
- Animaciones suaves
- Totalmente responsive
- Notificaciones integradas

---

## 🛠️ Desarrollo

### Instalar nuevas dependencias

```bash
npm install react-router-dom  # Por ejemplo
```

### Crear nuevo componente

```
src/components/MiComponente.jsx
src/components/MiComponente.module.css
```

### Usar Context

```jsx
import { useAuth } from '../context/AuthContext';

function MiComponente() {
  const { user, token } = useAuth();
  // ...
}
```

### Usar Hook personalizado

```jsx
import { useNotification } from '../hooks/useNotification';

function MiComponente() {
  const { notification, show } = useNotification();
  
  show('¡Éxito!', 'success');
  // ...
}
```

---

## 📦 Scripts

```bash
npm run dev       # Inicia servidor de desarrollo
npm run build     # Build para producción
npm run preview   # Preview del build
npm run lint      # Ejecutar linter (si está configurado)
```

---

## 📱 Responsive

- **Desktop**: Grid de 3+ columnas
- **Tablet**: Grid de 2 columnas
- **Móvil**: Una columna

---

## 🔒 Seguridad

- Tokens JWT almacenados en localStorage
- Headers de autenticación automáticos
- Validación de permisos en frontend
- CORS configurado en API

---

## 💡 Tips

- Los estilos se organizan por componente con CSS Modules
- Cada componente tiene su propio archivo de estilos
- Variables CSS globales en `index.css`
- Usa `useNotification` para feedback de usuario
- Context API maneja auth globalmente

---

## 🎓 Recursos

- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [Context API](https://react.dev/reference/react/useContext)

---

**¡Listo para desarrollar! 🚀**
