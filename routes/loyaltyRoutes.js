import express from 'express';
import { addLoyaltyPointsController, getUserPointsController } from '../controllers/loyaltyPointController.js';
import { isAuth } from "./../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/add', isAuth, addLoyaltyPointsController);
router.get('/:userId', isAuth, getUserPointsController);

export default router;