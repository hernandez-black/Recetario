import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './RecipeSidebar.module.css';
import { useAuth } from '../../context/AuthContext';
import AdsterraSidebar from '../ads/AdsterraSidebar';

export default function RecipeSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'change') {
      const value = e.target.value;
      setSearchTerm(value);
      if (value.trim() !== '') {
        navigate(`/my-recipes?search=${encodeURIComponent(value)}`);
      } else {
        navigate(`/my-recipes`);
      }
    }
  };
  
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <h2 className={styles.title}>RECETARIO</h2>
      </div>

      <nav className={styles.navGroup}>
        <div className={styles.searchBox} style={{ margin: '10px 15px', width: 'auto' }}>
          <span className={styles.searchIcon}>🔍</span>
          <input 
            type="text" 
            placeholder="Buscar en tu Recetario" 
            className={styles.searchInput}
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e); }}
          />
        </div>

        <div className={styles.navItemWrapper}>
          <button className={`${styles.navLink} ${styles.disabled}`} disabled>
            <span className={styles.icon}>🏷️</span> Premium
            <span className={styles.comingSoon}>Coming soon</span>
          </button>
        </div>

        <div className={styles.navItemWrapper}>
          <button className={`${styles.navLink} ${styles.disabled}`} disabled>
            <span className={styles.icon}>📊</span> Estadísticas
            <span className={styles.comingSoon}>Coming soon</span>
          </button>
        </div>
      </nav>

      <div className={styles.userSection}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.icon}>📖</span> Tu Recetario
        </h3>

        <ul className={styles.subList}>
          <li>
            <NavLink to="/my-recipes" className={styles.subLink}>
              <span className={styles.iconBox}>📑</span> Todo
            </NavLink>
          </li>
          <li>
            <NavLink to="/saved" className={styles.subLink}>
              <span className={styles.iconBox}>🔖</span> Guardadas
            </NavLink>
          </li>
        </ul>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <AdsterraSidebar />
      </div>
    </aside>
  );
}
