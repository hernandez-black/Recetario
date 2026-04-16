import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Notification from './components/Notification';
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';
import CreateRecipePage from './pages/CreateRecipePage';
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
        <Route path="/create" element={<CreateRecipePage />} />
      </Routes>
    </div>
  );
}

export default App;
