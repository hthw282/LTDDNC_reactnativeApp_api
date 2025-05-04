import express from "express";
import { isAdmin, isAuth } from "./../middlewares/authMiddleware.js";
import {
  createCommentController,
  createProductController,
  deleteCommentController,
  deleteProductController,
  deleteProductImageController,
  getAllProductsController,
  getCommentsByProductController,
  getProductReviewsController,
  getSimilarProductsController,
  getSingleProductController,
  getTopProductsController,
  productReviewController,
  updateProductController,
  updateProductImageController,
} from "../controllers/productController.js";
import { singleUpload } from "../middlewares/multer.js";
import { addViewedProductController, getViewedProductsController } from "../controllers/viewedProductsController.js";
import { countTotalPurchasesForProductController } from "../controllers/orderController.js";

const router = express.Router();

//rroutes
// // ============== PRODUCT ROUTES ==================

// GET ALL PRODUCTS
router.get("/get-all", getAllProductsController);

// GET TOP PRODUCTS
router.get("/top", getTopProductsController);


// CREATE PRODUCT
router.post("/create", isAuth, singleUpload, createProductController);

// UPDATE PRODUCT
router.put("/:id", isAuth, updateProductController);

// UPDATE PRODUCT IMAGE
router.put(
  "/image/:id",
  isAuth,
  singleUpload,
  updateProductImageController
);

// delete product image
router.delete(
  "/delete-image/:id",
  isAuth,
  deleteProductImageController
);

// delete product
router.delete("/delete/:id", isAuth, isAdmin, deleteProductController);

//REVIEW PRODUCT
router.put("/:id/review", isAuth, productReviewController);
router.get("/:productId/reviews", getProductReviewsController);


//COMMENT
router.post("/comment", isAuth, createCommentController);
router.get("/comments/:productId", getCommentsByProductController);
router.delete("/comment/:commentId", isAuth, deleteCommentController);

//GET PRODUCT
router.get("/similar/:productId", getSimilarProductsController);

//VIEWED PRODUCTS
router.post("/:productId/viewed", isAuth, addViewedProductController);
router.get("/viewed", isAuth, getViewedProductsController);

// COUNT TOTAL PURCHASE
router.get("/count-purchase/:productId", countTotalPurchasesForProductController);
// // ====================================================================

// GET SINGLE PRODUCTS
router.get("/:id", getSingleProductController);

export default router;