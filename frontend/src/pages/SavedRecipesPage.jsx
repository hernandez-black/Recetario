import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeList from '../components/recipes/RecipeList';
import RecipeDetail from '../components/recipes/RecipeDetail';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../hooks/useRecipes';

function SavedRecipesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const {
    recipes,
    loading,
    selectedRecipe,
    setSelectedRecipe,
    setFilter,
    handleLoadFavorites,
    handleViewRecipe,
    handleFavorite,
    handleDeleteRecipe,
    handleAddComment,
    handleDeleteComment,
    handleEditRecipe
  } = useRecipes();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else {
        setFilter('favorites');
        handleLoadFavorites();
      }
    }
  }, [user, authLoading, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading || !user) {
    return <div className="loading-page">Cargando...</div>;
  }

  return (
    <main className="main" id="main-content" style={{ paddingTop: '20px' }}>
      <section className="recipes-section">
        <div className="section-header">
          <h2>⭐ Tus Favoritos Guardados</h2>
        </div>

        <RecipeList
          recipes={recipes}
          loading={loading}
          onViewRecipe={handleViewRecipe}
          onFavorite={handleFavorite}
          onDelete={handleDeleteRecipe}
          onEdit={handleEditRecipe}
        />
      </section>

      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onDelete={handleDeleteRecipe}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      )}
    </main>
  );
}

export default SavedRecipesPage;
