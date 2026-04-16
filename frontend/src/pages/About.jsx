import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  return (
    <>
      <div className="hero" style={{ height: '40vh', minHeight: '300px', borderBottom: 'none' }}>
        <div className="hero-overlay" style={{ background: 'rgba(255, 255, 255, 0.7)' }}></div>
        <div className="hero-content">
          <h1 className="hero-title" style={{ fontSize: '4rem' }}>Nuestra Historia</h1>
          <p className="hero-subtitle">Pasión por la alta cocina y las buenas recetas.</p>
        </div>
      </div>

      <main className="main" id="main-content" style={{ maxWidth: '800px', textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', lineHeight: '2', color: 'var(--dark)', marginBottom: '30px' }}>
          En <strong>Recetario</strong>, creemos que la comida es más que solo sustento; es una experiencia que une a las personas. 
          Nuestra plataforma nació con la idea de compartir las mejores recetas de chefs y entusiastas de todo el mundo, 
          creando un catálogo curado de platillos <em>Fresh & Delicious</em>.
        </p>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#666', marginBottom: '50px' }}>
          Desde entrantes ligeros hasta banquetes completos, cada receta está diseñada para poder
          prepararse con amor en casa o en cocinas profesionales. ¡Únete a nosotros y descubre tu próximo platillo favorito!
        </p>

        <button className="btn active" onClick={() => navigate('/')} style={{ letterSpacing: '2px' }}>
          EXPLORAR EL MENÚ
        </button>
      </main>
    </>
  );
}
