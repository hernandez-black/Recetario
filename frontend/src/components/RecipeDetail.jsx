import styles from './RecipeDetail.module.css';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function RecipeDetail({ recipe, onClose, onDelete, onAddComment, onDeleteComment }) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isOwner = user?.id === recipe.user_id;

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta lectura de voz.');
      return;
    }
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel(); // Limpiar antes de hablar
      const autor = recipe.username || 'Anónimo';
      const text = `Receta: ${recipe.title}. Creada por: ${autor}. Descripción: ${recipe.description}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setLoading(true);
    try {
      await onAddComment(recipe.id, commentText);
      setCommentText('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modal} onClick={() => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onClose();
    }}>
      <div 
        className={styles.content} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-title"
      >
        <button className={styles.close} onClick={() => {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
          onClose();
        }}>
          ✕
        </button>

        <div className={styles.header}>
          <h2 id="recipe-title">{recipe.title}</h2>
          <div className={styles.meta}>
            <p>👨‍🍳 {recipe.username || 'Anónimo'}</p>
            <p>📅 {new Date(recipe.created_at).toLocaleDateString()}</p>
            <button onClick={handleSpeak} className={styles.speakBtn} aria-label={isSpeaking ? "Detener lectura" : "Escuchar receta en voz alta"} title="Narrador">
              {isSpeaking ? '⏹️ Detener' : '🔊 Escuchar'}
            </button>
          </div>
        </div>

        {recipe.image_url && (
          <img src={`http://localhost:3001${recipe.image_url}`} alt={recipe.title} className={styles.image} />
        )}

        <div className={styles.description}>
          <h3>📝 Descripción:</h3>
          <p>{recipe.description.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}</p>
        </div>

        <div className={styles.comments}>
          <h3>💬 Comentarios ({(recipe.comments || []).length})</h3>

          <form onSubmit={handleAddComment} className={styles.commentForm}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario..."
              rows="3"
            />
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Enviando...' : 'Comentar'}
            </button>
          </form>

          <div className={styles.commentsList}>
            {(recipe.comments || []).map((comment) => (
              <div key={comment.id} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <div>
                    <span className={styles.author}>{comment.username || 'Anónimo'}</span>
                    <span className={styles.date}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {comment.user_id === user?.id && (
                    <button
                      className={styles.deleteComment}
                      onClick={() => onDeleteComment(comment.id)}
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <p className={styles.commentContent}>{comment.content}</p>
              </div>
            ))}
          </div>
        </div>

        {isOwner && (
          <div className={styles.actions}>
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(recipe.id)}
            >
              🗑️ Eliminar Receta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
