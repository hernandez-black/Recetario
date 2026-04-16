import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Para saber si es admin
import axios from 'axios'; // Asumiendo que usas axios
import styles from './AdminPanel.module.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserRecipes, setSelectedUserRecipes] = useState([]);
  const [viewMode, setViewMode] = useState('users'); // 'users' o 'recipes'
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Cargar usuarios al iniciar
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // TODO: Aquí conectaremos con tu backend real
      // const response = await axios.get('http://localhost:3000/api/admin/users');
      // setUsers(response.data);
      
      // POR AHORA: Datos falsos para que veas cómo queda la vista
      setUsers([
        { id: 1, username: 'usuario1', email: 'uno@test.com' },
        { id: 2, username: 'cocinero_pro', email: 'dos@test.com' }
      ]);
    } catch (err) {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('¿Seguro que quieres eliminar este usuario?')) {
      console.log('Borrando usuario id:', id);
      // Lógica de borrado...
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleViewRecipes = (user) => {
    setCurrentUser(user);
    setViewMode('recipes');
    // Aquí harías una petición al backend para las recetas de este usuario
    setSelectedUserRecipes([
      { id: 101, title: 'Pastel de Chocolate', user_id: user.id },
      { id: 102, title: 'Tacos de Canasta', user_id: user.id }
    ]);
  };

  const handleDeleteRecipe = (recipeId) => {
    if (window.confirm('¿Eliminar esta receta?')) {
      console.log('Borrando receta:', recipeId);
      setSelectedUserRecipes(selectedUserRecipes.filter(r => r.id !== recipeId));
    }
  };

  const goBackToUsers = () => {
    setViewMode('users');
    setCurrentUser(null);
    setSelectedUserRecipes([]);
  };

  if (loading) return <div className={styles.loading}>Cargando panel...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Panel de Administrador</h1>
      <p className={styles.subtitle}>Administrando como: {user?.username || 'Admin'}</p>

      {/* VISTA 1: LISTA DE USUARIOS */}
      {viewMode === 'users' && (
        <div className={styles.card}>
          <h2>👥 Usuarios Registrados</h2>
          <div className={styles.tableContainer}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td className={styles.actions}>
                      <button 
                        className={`${styles.btn} ${styles.btnView}`}
                        onClick={() => handleViewRecipes(u)}
                      >
                        👁️ Ver Recetas
                      </button>
                      <button 
                        className={`${styles.btn} ${styles.btnDelete}`}
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 2: RECETAS DE UN USUARIO ESPECÍFICO */}
      {viewMode === 'recipes' && currentUser && (
        <div className={styles.card}>
          <div className={styles.headerRecipes}>
            <button className={styles.backBtn} onClick={goBackToUsers}> Volver a usuarios</button>
            <h2>📜 Recetas de {currentUser.username}</h2>
          </div>
          
          {selectedUserRecipes.length === 0 ? (
            <p>Este usuario no tiene recetas.</p>
          ) : (
            <ul className={styles.recipeList}>
              {selectedUserRecipes.map(recipe => (
                <li key={recipe.id} className={styles.recipeItem}>
                  <span>{recipe.title}</span>
                  <button 
                    className={`${styles.btn} ${styles.btnDelete}`}
                    onClick={() => handleDeleteRecipe(recipe.id)}
                  >
                    ❌ Borrar Receta
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;