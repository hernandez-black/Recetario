const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const recipeController = require('../controllers/recipeController');
const commentController = require('../controllers/commentController');
const favoriteController = require('../controllers/favoriteController');
const imageController = require('../controllers/imageController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');
const verifyAdmin = require('../middlewares/verifyAdmin');


// Image routes
router.get('/images/:id', imageController.getImage);

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Recipe routes
router.get('/recipes', recipeController.getAllRecipes); // Público
router.get('/recipes/:id', recipeController.getRecipeById); // Público
router.post('/recipes', authMiddleware, recipeController.upload.any(), recipeController.createRecipe); // Privado
router.patch('/recipes/:id', authMiddleware, recipeController.upload.any(), recipeController.updateRecipe); // Privado
router.delete('/recipes/:id', authMiddleware, recipeController.deleteRecipe); // Privado

// Comment routes
router.post('/recipes/:recipe_id/comments', authMiddleware, commentController.addComment);
router.delete('/comments/:id', authMiddleware, commentController.deleteComment);

// Favorite routes
router.post('/recipes/:recipe_id/favorite', authMiddleware, favoriteController.toggleFavorite);
router.get('/favorites', authMiddleware, favoriteController.getMyFavorites);

// Acciones del Administrador
// Obtener todos los usuarios
router.get('/admin/users', verifyAdmin, adminController.getAllUsers);

// Obtener recetas de un usuario específico
router.get('/admin/users/:id/recipes', verifyAdmin, adminController.getUserRecipes);

// Eliminar un usuario
router.delete('/admin/users/:id', verifyAdmin, adminController.deleteUser);

// Eliminar una receta
router.delete('/admin/recipes/:id', verifyAdmin, adminController.deleteRecipe);
// Para cambiar a admin un usuario
router.patch('/admin/users/:id/role', verifyAdmin, adminController.toggleUserRole);



// PARA ETIQUETAS
router.get('/tags', recipeController.getAllTags);


module.exports = router;
