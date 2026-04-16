import { useState } from 'react';
import styles from './CreateRecipeForm.module.css';

export default function CreateRecipeForm({ onSubmit, loading }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    await onSubmit(title, description, image);
    setTitle('');
    setDescription('');
    setImage(null);
    e.target.reset();
  };

  return (
    <div className={styles.card}>
      <h2>Nueva Receta</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Título:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nombre de la receta"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Descripción (Ingredientes):</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ingredientes y modo de preparación..."
            rows="6"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="image">Imagen:</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Creando...' : 'Crear Receta'}
        </button>
      </form>
    </div>
  );
}
