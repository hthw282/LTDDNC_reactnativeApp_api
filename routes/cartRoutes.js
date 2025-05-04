import express from 'express';
import { isAuth } from "./../middlewares/authMiddleware.js";
import { getCartController, updateCartController } from '../controllers/cartController.js';

const router = express.Router();

router.post('/update', isAuth, updateCartController);
router.get('/:userId', isAuth,  getCartController);

export default router;