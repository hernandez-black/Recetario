const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const recipeController = require('../controllers/recipeController');
const commentController = require('../controllers/commentController');
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middlewares/authMiddleware');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Recipe routes
router.get('/recipes', recipeController.getAllRecipes); // Público
router.get('/recipes/:id', recipeController.getRecipeById); // Público
router.post('/recipes', authMiddleware, recipeController.upload.single('image'), recipeController.createRecipe); // Privado
router.patch('/recipes/:id', authMiddleware, recipeController.upload.single('image'), recipeController.updateRecipe); // Privado
router.delete('/recipes/:id', authMiddleware, recipeController.deleteRecipe); // Privado

// Comment routes
router.post('/recipes/:recipe_id/comments', authMiddleware, commentController.addComment);
router.delete('/comments/:id', authMiddleware, commentController.deleteComment);

// Favorite routes
router.post('/recipes/:recipe_id/favorite', authMiddleware, favoriteController.toggleFavorite);
router.get('/favorites', authMiddleware, favoriteController.getMyFavorites);

module.exports = router;
