import styles from './RecipeCard.module.css';
import { useAuth } from '../../context/AuthContext';

export default function RecipeCard({ recipe, onView, onFavorite, onDelete, onEdit }) {
  const { user } = useAuth();
  const isOwner = user?.id === recipe.user_id;

  return (
    <article 
      className={styles.card} 
      onClick={() => onView(recipe.id)}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalles de la receta ${recipe.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView(recipe.id);
        }
      }}
    >
      <div className={styles.image}>
        {recipe.image_url ? (
          <img 
            src={recipe.image_url.startsWith('http') ? recipe.image_url : `http://localhost:3001${recipe.image_url}`} 
            alt={recipe.title} 
          />
        ) : (
          <div className={styles.placeholder}>🍲</div>
        )}
      </div>

      <div className={styles.content}>
        <h3>{recipe.title}</h3>
        <div className={styles.meta}>
          <p>👨‍🍳 {recipe.username || 'Anónimo'}</p>
          <p>📅 {new Date(recipe.created_at).toLocaleDateString()}</p>
        </div>
        <p className={styles.description}>
          {recipe.description.substring(0, 100)}...
        </p>

        <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
          <button
            className={styles.btnFavorite}
            onClick={() => onFavorite(recipe.id)}
            aria-label={`Marcar ${recipe.title} como favorito`}
            tabIndex={0}
          >
            ⭐ Favorito
          </button>
          {isOwner && (
            <>
              <button
                className={styles.btnEdit}
                onClick={() => onEdit(recipe.id)}
                aria-label={`Editar la receta ${recipe.title}`}
                tabIndex={0}
              >
                ✏️ Editar
              </button>
              <button
                className={styles.btnDelete}
                onClick={() => onDelete(recipe.id)}
                aria-label={`Eliminar la receta ${recipe.title}`}
                tabIndex={0}
              >
                🗑️ Eliminar
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
