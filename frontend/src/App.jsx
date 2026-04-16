import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Notification from './components/common/Notification';
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';
import CreateRecipePage from './pages/CreateRecipePage';
import MyRecipesPage from './pages/MyRecipesPage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import RecipeDashboardLayout from './components/layout/RecipeDashboardLayout';
import AdminPanel from './pages/AdminPanel'; // ✅ AGREGADO
import { useNotification } from './hooks/useNotification';
import './App.css';

function App() {
  const { notification } = useNotification();

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
      <Header />
      <Notification notification={notification} />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas con Sidebar Lateral */}
        <Route element={<RecipeDashboardLayout />}>
          <Route path="/create" element={<CreateRecipePage />} />
          <Route path="/edit/:id" element={<CreateRecipePage />} />
          {/* Rutas exclusivas del Sidebar en el Dashboard Layout */}
          <Route path="/my-recipes" element={<MyRecipesPage />} />
          <Route path="/saved" element={<SavedRecipesPage />} />
        </Route>

        <Route path="/admin" element={<AdminPanel />} /> {/* ✅ AGREGADO */}
      </Routes>
    </div>
  );
}

export default App;