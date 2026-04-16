import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateRecipeForm from '../components/CreateRecipeForm';
import { useRecipes } from '../hooks/useRecipes';
import { useAuth } from '../context/AuthContext';

export default function CreateRecipePage() {
  const { handleCreateRecipe, loading } = useRecipes();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Verificando sesión...</div>;
  }

  const onSubmit = async (formData) => {
    await handleCreateRecipe(formData); // the hook needs to accept formData
    navigate('/');
  };

  return (
    <>
      <CreateRecipeForm onSubmit={onSubmit} loading={loading} />
    </>
  );
}
