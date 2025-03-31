import express from 'express';
import { createVoucherController, deleteVoucherController, getAllVouchersController } from '../controllers/voucherController.js';
import { isAuth } from "./../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/create', isAuth, createVoucherController);
router.get('/all',isAuth,  getAllVouchersController);
router.delete('/delete/:id', isAuth, deleteVoucherController);

export default router;