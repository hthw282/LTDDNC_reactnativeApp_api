import express from 'express'
import { registerController, loginController, getUserProfileController, logoutController, updateProfileController, updatePasswordController, updateProfilePicController, sendRegisterOtpController, verifyOtpController, resetPasswordController, sendCheckOtpController } from '../controllers/userController.js'
import { isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from '../middlewares/multer.js';

//router object 
const router = express.Router()

//routes
router.post('/register', registerController)
router.post('/send-otp', sendRegisterOtpController)
router.post('/verify-otp', verifyOtpController)
router.post('/send-check-otp', sendCheckOtpController)
router.post('/reset-password', resetPasswordController)
router.post('/login', loginController)
router.get('/profile', isAuth, getUserProfileController)
router.get('/logout', isAuth, logoutController)
router.put('/update-profile', isAuth, updateProfileController)
router.put('/update-password', isAuth, updatePasswordController)
router.put('/update-picture', isAuth, singleUpload, updateProfilePicController)
//export
export default router