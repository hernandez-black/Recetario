import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateRecipeForm from '../components/CreateRecipeForm';
import { useRecipes } from '../hooks/useRecipes';
import { useAuth } from '../context/AuthContext';

export default function CreateRecipePage() {
  const { handleCreateRecipe, loading } = useRecipes();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const onSubmit = async (...args) => {
    await handleCreateRecipe(...args);
    navigate('/');
  };

  return (
    <main className="main" id="main-content" style={{ maxWidth: '800px', marginTop: '40px' }}>
      <div style={{ marginBottom: '30px' }}>
        <button className="btn" onClick={() => navigate('/')} aria-label="Regresar al inicio">
          ← Regresar al Inicio
        </button>
      </div>
      <h2 style={{ marginBottom: '20px', fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '2.5rem' }}>
        Crear Nueva Receta
      </h2>
      <CreateRecipeForm onSubmit={onSubmit} loading={loading} />
    </main>
  );
}
