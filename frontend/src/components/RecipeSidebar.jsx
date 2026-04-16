import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './RecipeSidebar.module.css';
import { useAuth } from '../context/AuthContext';

export default function RecipeSidebar() {
  const { user } = useAuth();
  
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <h2 className={styles.title}>RECETARIO</h2>
      </div>

      <nav className={styles.navGroup}>
        <button className={styles.navLink} onClick={() => alert('Search en tu Recetario activado')}>
          <span className={styles.icon}>🔍</span> Buscar
        </button>

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
        
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input 
            type="text" 
            placeholder="Buscar en tu Recetario" 
            className={styles.searchInput}
            // Logic to filter only user's recipes can be implemented in parent or globally
          />
        </div>

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
    </aside>
  );
}
