const API_BASE_URL = 'http://localhost:3001/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    if (data.error) throw new Error(data.error);
    throw new Error('Ocurrió un error en el servidor o la petición');
  }
  return data;
};

export const api = {
  // Auth
  register: async (email, password, username) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });
    return handleResponse(response);
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  // Recipes
  getRecipes: async () => {
    const response = await fetch(`${API_BASE_URL}/recipes`);
    return handleResponse(response);
  },

  getRecipe: async (id) => {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`);
    return handleResponse(response);
  },

  createRecipe: async (formData, token) => {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return handleResponse(response);
  },

  updateRecipe: async (id, title, description, image, token) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (image) formData.append('image', image);

    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return handleResponse(response);
  },

  deleteRecipe: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  // Comments
  addComment: async (recipeId, content, token) => {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });
    return handleResponse(response);
  },

  deleteComment: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  // Favorites
  toggleFavorite: async (recipeId, token) => {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/favorite`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  getFavorites: async (token) => {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  }
};
