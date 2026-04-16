import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import styles from './AdminPanel.module.css';

const AdminPanel = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserRecipes, setSelectedUserRecipes] = useState([]);
  const [viewMode, setViewMode] = useState('users'); // 'users' o 'recipes'
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Configuración de axios con token
  const api = axios.create({
  baseURL: 'http://localhost:3001/api',  // ← ✅ Puerto correcto (3001)
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`¿Estás seguro de eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      alert('Usuario eliminado exitosamente');
    } catch (err) {
      alert(err.response?.data?.error || 'Error eliminando usuario');
    }
  };

  const handleViewRecipes = async (user) => {
    try {
      setCurrentUser(user);
      const response = await api.get(`/admin/users/${user.id}/recipes`);
      setSelectedUserRecipes(response.data.recipes);
      setViewMode('recipes');
    } catch (err) {
      alert('Error cargando recetas del usuario');
    }
  };

  const handleDeleteRecipe = async (recipeId, recipeTitle) => {
    if (!window.confirm(`¿Eliminar la receta "${recipeTitle}"?`)) {
      return;
    }
    
    try {
      await api.delete(`/admin/recipes/${recipeId}`);
      setSelectedUserRecipes(selectedUserRecipes.filter(r => r.id !== recipeId));
      alert('Receta eliminada exitosamente');
    } catch (err) {
      alert(err.response?.data?.error || 'Error eliminando receta');
    }
  };

  const goBackToUsers = () => {
    setViewMode('users');
    setCurrentUser(null);
    setSelectedUserRecipes([]);
  };

  const handleToggleRole = async (userId, username, currentRole) => {
  const newRole = currentRole === 'admin' ? 'user' : 'admin';
  
  if (!window.confirm(`¿Cambiar el rol de "${username}" de "${currentRole}" a "${newRole}"?`)) {
    return;
  }
  
  try {
    await api.patch(`/admin/users/${userId}/role`);
    
    // Actualizar la lista de usuarios localmente
    setUsers(users.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
    
    alert(`✅ ${username} ahora es ${newRole}`);
  } catch (err) {
    alert(err.response?.data?.error || 'Error al cambiar el rol');
  }
};

  if (loading) return <div className={styles.loading}>Cargando panel...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Panel de Administrador</h1>
      <p className={styles.subtitle}>Administrando como: {user?.username || 'Admin'}</p>

      {viewMode === 'users' && (
        <div className={styles.card}>
          <h2>👥 Usuarios Registrados ({users.length})</h2>
          <div className={styles.tableContainer}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                        <span 
                            className={`${styles.badge} ${u.role === 'admin' ? styles.admin : styles.user}`}
                            onClick={() => handleToggleRole(u.id, u.username, u.role)}
                            style={{ cursor: 'pointer' }}
                            title={`Click para cambiar a ${u.role === 'admin' ? 'user' : 'admin'}`}
                        >
                            {u.role} {u.role === 'admin' ? '👑' : '👤'}
                        </span>
                    </td>
                    <td className={styles.actions}>
                      <button 
                        className={`${styles.btn} ${styles.btnView}`}
                        onClick={() => handleViewRecipes(u)}
                      >
                        👁️ Ver Recetas
                      </button>
                      <button 
                        className={`${styles.btn} ${styles.btnDelete}`}
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        disabled={u.role === 'admin'}
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

      {viewMode === 'recipes' && currentUser && (
        <div className={styles.card}>
          <div className={styles.headerRecipes}>
            <button className={styles.backBtn} onClick={goBackToUsers}>← Volver a usuarios</button>
            <h2>📜 Recetas de {currentUser.username}</h2>
          </div>
          
          {selectedUserRecipes.length === 0 ? (
            <p className={styles.empty}>Este usuario no tiene recetas publicadas.</p>
          ) : (
            <ul className={styles.recipeList}>
              {selectedUserRecipes.map(recipe => (
                <li key={recipe.id} className={styles.recipeItem}>
                  <div>
                    <strong>{recipe.title}</strong>
                    <p className={styles.recipeDesc}>{recipe.description?.substring(0, 100)}...</p>
                  </div>
                  <button 
                    className={`${styles.btn} ${styles.btnDelete}`}
                    onClick={() => handleDeleteRecipe(recipe.id, recipe.title)}
                  >
                    ❌ Eliminar
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