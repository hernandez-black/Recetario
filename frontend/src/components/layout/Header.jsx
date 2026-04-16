import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <nav className={styles.navLeft}>
        <Link to="/about" className={styles.navLink}>ABOUT</Link>
        <Link to="/" className={styles.navLink}>MENU</Link>
      </nav>

      <div className={styles.logoContainer}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 className={styles.title}>RECETARIO</h1>
        </Link>
      </div>

      <div className={styles.navRight}>
        <button 
          onClick={toggleTheme} 
          className={styles.themeToggleBtn}
          aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
          title="Alternar tema"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        {user ? (
          <div className={styles.userInfo}>
            {user.role === 'admin' && (
              <Link to="/admin" className={styles.navLinkBtn} style={{ color: '#e74c3c' }}>ADMIN</Link>
            )}
            <span className={styles.userName}>{user.username}</span>
            <button onClick={handleLogout} className={styles.navLinkBtn}>LOGOUT</button>
          </div>
        ) : (
          <span className={styles.navLink}>LOGIN</span>
        )}
      </div>
    </header>
  );
}
