import { useState, useRef, useEffect } from 'react';
import styles from './CreateRecipeForm.module.css';

import { useNavigate } from 'react-router-dom';

export default function CreateRecipeForm({ onSubmit, loading, initialData }) {
  const navigate = useNavigate();
  // ... (rest is unchanged except the header actions)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  
  const [diners, setDiners] = useState('');
  const [ingredients, setIngredients] = useState([{ id: 1, text: '' }]);
  
  const [cookTime, setCookTime] = useState('');
  const [steps, setSteps] = useState([{ id: 1, text: '', image: null, preview: null }]);

  // 🏷️ Estados para etiquetas
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  const mainImageInputRef = useRef(null);

  // 🏷️ Cargar etiquetas disponibles al montar
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setTagsLoading(true);
        const response = await fetch('http://localhost:3001/api/tags');
        const data = await response.json();
        if (data.tags) {
          setAvailableTags(data.tags);
        }
      } catch (error) {
        console.error('Error cargando etiquetas:', error);
      } finally {
        setTagsLoading(false);
      }
    };
    fetchTags();
  }, []);

  // Pre-llenar datos en modo Edición
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setDiners(initialData.diners || '');
      setCookTime(initialData.cook_time || '');
      
      // La API nos da /uploads/archivo.png o una URL completa, lo preparamos para el preview
      if (initialData.image_url) {
        // En "editar", indicamos que ya no requerimos imagen si no se sube otra nueva
        setMainImage('existing_image'); 
        setMainImagePreview(initialData.image_url.startsWith('http') ? initialData.image_url : `http://localhost:3001${initialData.image_url}`);
      }

      if (initialData.ingredients && Array.isArray(initialData.ingredients) && initialData.ingredients.length > 0) {
        setIngredients(initialData.ingredients.map((text, idx) => ({ id: idx, text })));
      }
      
      if (initialData.steps && Array.isArray(initialData.steps) && initialData.steps.length > 0) {
        setSteps(initialData.steps.map((step, idx) => ({ 
          id: idx, 
          text: typeof step === 'string' ? step : step.text || '', 
          image: null, 
          preview: step.image_url 
             ? (step.image_url.startsWith('http') ? step.image_url : `http://localhost:3001${step.image_url}`)
             : null 
        })));
      }

      // Si initialData ya tiene tags (el array debe venir del backend si aplica)
      if (initialData.tags && Array.isArray(initialData.tags)) {
        setSelectedTags(initialData.tags);
      }
    }
  }, [initialData]);

  // 🏷️ Toggle para seleccionar/deseleccionar etiqueta
  const toggleTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleStepImageChange = (id, e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSteps(steps.map(step => 
        step.id === id 
          ? { ...step, image: file, preview: URL.createObjectURL(file) } 
          : step
      ));
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { id: Date.now(), text: '' }]);
  };

  const updateIngredient = (id, text) => {
    setIngredients(ingredients.map(ing => ing.id === id ? { ...ing, text } : ing));
  };

  const addStep = () => {
    setSteps([...steps, { id: Date.now(), text: '', image: null, preview: null }]);
  };

  const updateStepText = (id, text) => {
    setSteps(steps.map(step => step.id === id ? { ...step, text } : step));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !mainImage) {
      alert('El título, descripción y foto de la receta son obligatorios.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('diners', diners);
    formData.append('cook_time', cookTime);
    
    // Si metieron imagen nueva (de tipo File), apendizar. 
    // Si mainImage === 'existing_image', no enviamos archivo nuevo.
    if (mainImage instanceof File) {
      formData.append('image', mainImage);
    }

    // Filter out empty ingredients
    const validIngredients = ingredients.filter(i => i.text.trim() !== '');
    formData.append('ingredients', JSON.stringify(validIngredients));

    // Filter out empty steps, and append step images dynamically
    const validSteps = [];
    steps.forEach((step, index) => {
      if (step.text.trim() !== '') {
        validSteps.push({ id: step.id, text: step.text });
        if (step.image) {
          formData.append(`step_image_${validSteps.length - 1}`, step.image);
        }
      }
    });
    
    formData.append('steps', JSON.stringify(validSteps));

    // 🏷️ Agregar etiquetas seleccionadas al formData
    if (selectedTags.length > 0) {
      formData.append('tags', JSON.stringify(selectedTags));
    }

    await onSubmit(formData);
  };

  return (
    <div className={styles.builderContainer}>
      <div className={styles.headerActions}>
        <button type="button" className={styles.btnOutline} onClick={() => navigate('/')}>Cancelar</button>
        <button type="button" className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Publicar')}
        </button>
      </div>

      <div className={styles.topSection}>
        <div 
          className={styles.mainImageUpload} 
          onClick={() => mainImageInputRef.current?.click()}
        >
          {mainImagePreview ? (
            <img src={mainImagePreview} alt="Receta" className={styles.previewImage} />
          ) : (
            <div className={styles.uploadPlaceholder}>
              <span className={styles.iconCamera}>📷</span>
              <p className={styles.uploadTitle}>Publicar foto del plato terminado</p>
              <p className={styles.uploadSubtitle}>Comparte tu plato terminado con otros cocineros</p>
            </div>
          )}
          <input 
            type="file" 
            ref={mainImageInputRef} 
            accept="image/*" 
            onChange={handleMainImageChange} 
            style={{ display: 'none' }} 
          />
        </div>

        <div className={styles.mainInfo}>
          <input 
            type="text" 
            className={styles.titleInput} 
            placeholder="Título: Mi sopa de calabaza favorita" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <textarea 
            className={styles.storyInput}
            placeholder="Comparte un poco más acerca de este plato. ¿Qué o quién te inspiró a cocinarlo? ¿Qué lo hace especial para ti?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* 🏷️ Sección de Etiquetas */}
      <div className={styles.tagsSection}>
        <h3 className={styles.sectionTitle}>Etiquetas (opcional)</h3>
        <p className={styles.tagsHint}>Selecciona las que describan tu receta</p>
        
        {tagsLoading ? (
          <div className={styles.tagsLoading}>Cargando etiquetas...</div>
        ) : (
          <div className={styles.tagsGrid}>
            {availableTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                className={`${styles.tagButton} ${selectedTags.includes(tag.id) ? styles.selected : ''}`}
                style={{ 
                  backgroundColor: selectedTags.includes(tag.id) ? tag.color : '#f1f1f1',
                  color: selectedTags.includes(tag.id) ? 'white' : '#333',
                  borderColor: selectedTags.includes(tag.id) ? tag.color : '#ddd'
                }}
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
                {selectedTags.includes(tag.id) && <span className={styles.checkmark}> ✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.ingredientsSection}>
          <h3 className={styles.sectionTitle}>Ingredientes</h3>
          <div className={styles.dinersWrap}>
            <label>Comensales</label>
            <input 
              type="text" 
              placeholder="nº comensales" 
              className={styles.smallInput}
              value={diners}
              onChange={(e) => setDiners(e.target.value)}
            />
          </div>

          <div className={styles.ingredientsList}>
            {ingredients.map((ing) => (
              <div key={ing.id} className={styles.ingredientRow}>
                <span className={styles.dragIcon}>≡</span>
                <input 
                  type="text" 
                  placeholder="Ej: 250g harina" 
                  className={styles.itemInput}
                  value={ing.text}
                  onChange={(e) => updateIngredient(ing.id, e.target.value)}
                />
              </div>
            ))}
            <button type="button" className={styles.addBtn} onClick={addIngredient}>
              + Ingrediente
            </button>
          </div>
        </div>

        <div className={styles.stepsSection}>
          <h3 className={styles.sectionTitle}>Pasos</h3>
          <div className={styles.timeWrap}>
            <label>Tiempo</label>
            <input 
              type="text" 
              placeholder="Tiempo" 
              className={styles.smallInput}
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
            />
          </div>

          <div className={styles.stepsList}>
            {steps.map((step, index) => (
              <div key={step.id} className={styles.stepRow}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <span className={styles.dragIcon}>≡</span>
                  <textarea 
                    placeholder="Ej: Mezcla los huevos con la leche hasta..."
                    className={styles.stepInput}
                    value={step.text}
                    onChange={(e) => updateStepText(step.id, e.target.value)}
                  />
                </div>
                
                <div className={styles.stepImageWrapper}>
                  {step.preview ? (
                    <img src={step.preview} alt={`Paso ${index + 1}`} className={styles.stepPreview} />
                  ) : (
                    <label className={styles.stepImagePlaceholder}>
                      <span className={styles.iconCamera}>📷</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleStepImageChange(step.id, e)} 
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
            <button type="button" className={styles.addBtn} onClick={addStep}>
              + Paso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}