import express from 'express';
import { isAuth } from "./../middlewares/authMiddleware.js";
import { addToFavorite, deleteFromFavorite, getUserFavorites } from '../controllers/favoriteController.js';

const router = express.Router();

router.post('/add', isAuth, addToFavorite);
router.delete('/delete/:productId', isAuth, deleteFromFavorite);
router.get('/user-favorites', isAuth, getUserFavorites);

export default router;