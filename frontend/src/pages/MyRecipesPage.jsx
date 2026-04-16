import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RecipeList from '../components/recipes/RecipeList';
import RecipeDetail from '../components/recipes/RecipeDetail';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../hooks/useRecipes';

function MyRecipesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const {
    recipes,
    loading,
    selectedRecipe,
    setSelectedRecipe,
    setFilter,
    handleLoadMyRecipes,
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
        setFilter('mine');
        handleLoadMyRecipes();
      }
    }
  }, [user, authLoading, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading || !user) {
    return <div className="loading-page">Cargando...</div>;
  }

  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="main" id="main-content" style={{ paddingTop: '20px' }}>
      <section className="recipes-section">
        <div className="section-header">
          <h2>👨‍🍳 Mis Recetas</h2>
          <button 
            className="btn active" 
            onClick={() => navigate('/create')}
            aria-label="Ir a crear nueva receta"
          >
            + NUEVA RECETA
          </button>
        </div>

        <RecipeList
          recipes={filteredRecipes}
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

export default MyRecipesPage;
