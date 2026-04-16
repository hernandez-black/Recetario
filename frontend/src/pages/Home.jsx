import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeList from '../components/RecipeList';
import RecipeDetail from '../components/RecipeDetail';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../hooks/useRecipes';
import { useNotification } from '../hooks/useNotification';

function Home() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { show } = useNotification();
  
  const {
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
  } = useRecipes();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else {
        loadRecipes();
      }
    }
  }, [user, authLoading, navigate, loadRecipes]);

  if (authLoading || !user) {
    return <div className="loading-page">Cargando...</div>;
  }

  return (
    <>
      <div className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Comparte tu Receta</h1>
          <p className="hero-subtitle">Descubre, prepara y comparte las mejores recetas con la comunidad</p>
          <button 
            className="hero-btn"
            onClick={() => {
              document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Ver nuestro menú de recetas"
          >
            VER RECETAS &gt;
          </button>
        </div>
      </div>

      <main className="main" id="main-content">

      <section className="recipes-section">
        <div className="section-header">
          <h2>🍲 Recetas</h2>
          
          <button 
            className="btn active" 
            onClick={() => navigate('/create')}
            aria-label="Ir a crear nueva receta"
          >
            + NUEVA RECETA
          </button>

          <div className="filter-buttons">
            <button
              className={filter === 'all' ? 'btn active' : 'btn'}
              onClick={() => {
                setFilter('all');
                loadRecipes();
              }}
            >
              🔄 Todas
            </button>
            <button
              className={filter === 'favorites' ? 'btn active' : 'btn'}
              onClick={handleLoadFavorites}
            >
              ⭐ Favoritos
            </button>
            <button
              className={filter === 'mine' ? 'btn active' : 'btn'}
              onClick={handleLoadMyRecipes}
            >
              👨‍🍳 Mis Recetas
            </button>
          </div>
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
    </>
  );
}

export default Home;
