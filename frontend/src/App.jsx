import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Notification from './components/Notification';
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';
import CreateRecipePage from './pages/CreateRecipePage';
import RecipeDashboardLayout from './components/RecipeDashboardLayout';
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
          {/* Aquí puedes crear páginas reales /my-recipes después, por ahora muestran home o dummy */}
          <Route path="/my-recipes" element={<Home />} />
          <Route path="/saved" element={<Home />} />
        </Route>

        <Route path="/admin" element={<AdminPanel />} /> {/* ✅ AGREGADO */}
      </Routes>
    </div>
  );
}

export default App;