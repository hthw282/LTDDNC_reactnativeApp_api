import express from "express";
import { isAdmin, isAuth } from "./../middlewares/authMiddleware.js";
import {
    createBannerController,
    getAllBannersController,
    deleteBannerController,
    updateBannerController,
} from "../controllers/bannerController.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

//rroutes
// ============== CAT ROUTES ==================

// CREATE BRAND
router.post("/create", isAuth, singleUpload, createBannerController);

// GET ALL BRAND
router.get("/get-all", getAllBannersController);

// DELETE  BRAND
router.delete("/delete/:id", isAuth, isAdmin, deleteBannerController);

// UPDATE ALL BRAND
router.put("/update/:id", isAuth, isAdmin, updateBannerController);

// ====================================================================

export default router;