import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateRecipeForm from '../components/recipes/CreateRecipeForm';
import { useRecipes } from '../hooks/useRecipes';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function CreateRecipePage() {
  const { handleCreateRecipe, loading } = useRecipes();
  const { user, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [fetching, setFetching] = useState(!!id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id) {
      const loadRecipe = async () => {
        try {
          const data = await api.getRecipe(id);
          // Verificar propiedades básicas y evitar crasheos si es una data anterior sin ciertos campos
          if (typeof data.tags === 'string') {
            try { data.tags = JSON.parse(data.tags); } catch (e) { data.tags = []; }
          }
          if (typeof data.ingredients === 'string') {
            try { data.ingredients = JSON.parse(data.ingredients); } catch (e) { data.ingredients = []; }
          }
          if (typeof data.steps === 'string') {
            try { data.steps = JSON.parse(data.steps); } catch (e) { data.steps = []; }
          }
          setInitialData(data);
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      loadRecipe();
    } else {
      setFetching(false);
    }
  }, [id]);

  if (authLoading || fetching || !user) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando...</div>;
  }

  const onSubmit = async (formData) => {
    if (id) {
      await api.updateRecipe(id, formData.get('title'), formData.get('description'), formData.get('image'), token, formData);
      navigate('/');
    } else {
      await handleCreateRecipe(formData);
      navigate('/');
    }
  };

  return (
    <>
      <CreateRecipeForm onSubmit={onSubmit} loading={loading} initialData={initialData} />
    </>
  );
}
