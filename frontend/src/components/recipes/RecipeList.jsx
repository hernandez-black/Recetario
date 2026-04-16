import RecipeCard from './RecipeCard';
import styles from './RecipeList.module.css';

export default function RecipeList({
  recipes,
  loading,
  onViewRecipe,
  onFavorite,
  onDelete,
  onEdit
}) {
  if (loading) {
    return <div className={styles.loading}>Cargando recetas...</div>;
  }

  if (!recipes || recipes.length === 0) {
    return <div className={styles.empty}>No hay recetas disponibles</div>;
  }

  return (
    <div className={styles.grid}>
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onView={onViewRecipe}
          onFavorite={onFavorite}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
