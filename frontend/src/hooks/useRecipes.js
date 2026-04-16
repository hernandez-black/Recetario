import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from './useNotification';
import { useNavigate } from 'react-router-dom';

export const useRecipes = () => {
  const { token, user } = useAuth();
  const { show } = useNotification();
  const navigate = useNavigate();
  
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filter, setFilter] = useState('all');

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getRecipes();
      setRecipes(data);
      setFilter('all');
    } catch (error) {
      show(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [show]);

  const handleCreateRecipe = async (formData) => {
    try {
      await api.createRecipe(formData, token);
      show('¡Receta creada exitosamente!', 'success');
      loadRecipes();
    } catch (error) {
      show(error.message, 'error');
    }
  };

  const handleViewRecipe = async (id) => {
    try {
      const data = await api.getRecipe(id);
      setSelectedRecipe(data);
    } catch (error) {
      show(error.message, 'error');
    }
  };

  const handleFavorite = async (id) => {
    if (!token) {
      show('Debes iniciar sesión para marcar favoritos', 'error');
      return;
    }
    try {
      const data = await api.toggleFavorite(id, token);
      show(data.message, 'success');
      
      // Reload current filter logic
      if (filter === 'favorites') {
        handleLoadFavorites();
      } else if (filter === 'mine') {
        handleLoadMyRecipes();
      } else {
        loadRecipes();
      }
    } catch (error) {
      show(error.message, 'error');
    }
  };

  const handleDeleteRecipe = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto y la receta se eliminará.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) return;

    try {
      await api.deleteRecipe(id, token);
      show('Receta eliminada', 'success');
      setSelectedRecipe(null);
      loadRecipes();
    } catch (error) {
      show(error.message, 'error');
    }
  };

  const handleAddComment = async (recipeId, content) => {
    try {
      await api.addComment(recipeId, content, token);
      show('Comentario agregado', 'success');
      await handleViewRecipe(recipeId);
    } catch (error) {
      show(error.message, 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: '¿Eliminar este comentario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await api.deleteComment(commentId, token);
      show('Comentario eliminado', 'success');
      if (selectedRecipe) {
        await handleViewRecipe(selectedRecipe.id);
      }
    } catch (error) {
      show(error.message, 'error');
    }
  };

  const handleEditRecipe = async (id) => {
    navigate(`/edit/${id}`);
  };

  const handleLoadFavorites = async () => {
    try {
      const data = await api.getFavorites(token);
      setRecipes(data);
      setFilter('favorites');
    } catch (error) {
      show(error.message, 'error');
    }
  };

  const handleLoadMyRecipes = () => {
    if (user) {
      // Note: Ideally the backend should have a /my-recipes endpoint
      // but we filter locally if the backend doesn't offer it.
      // We load all then filter to keep it simple as originally implemented.
      api.getRecipes().then(data => {
        const myRecipes = data.filter((r) => r.user_id === user.id);
        setRecipes(myRecipes);
        setFilter('mine');
      }).catch(err => show(err.message, 'error'));
    }
  };

  return {
    recipes,
    loading,
    selectedRecipe,
    setSelectedRecipe,
    filter,
    setFilter,
    loadRecipes,
    handleCreateRecipe,
    handleViewRecipe,
    handleFavorite,
    handleDeleteRecipe,
    handleAddComment,
    handleDeleteComment,
    handleLoadFavorites,
    handleLoadMyRecipes,
    handleEditRecipe
  };
};
