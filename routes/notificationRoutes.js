import express from 'express';
import { isAuth } from "./../middlewares/authMiddleware.js";
import { sendNotificationController, sendNotificationToAllController, getNotificationsByUserController, markNotificationAsReadController } from '../controllers/notificationController.js';

const router = express.Router();

router.post('/send', isAuth, sendNotificationController)
router.post('/send-to-all', isAuth, sendNotificationToAllController)
router.get('/:userId', isAuth, getNotificationsByUserController)
router.put('/mark-as-read', isAuth, markNotificationAsReadController)

export default router;