import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // 🔐 Redirección inteligente según el rol
      if (user.role === 'admin') {
        console.log('🔐 Usuario admin detectado, redirigiendo a /admin');
        navigate('/admin');
      } else {
        console.log('👤 Usuario normal detectado, redirigiendo a /');
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="loading-page">Cargando...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <AuthForm 
        onSuccess={() => {
          // La redirección se maneja automáticamente en el useEffect
        }} 
      />
    </div>
  );
}

export default Login;