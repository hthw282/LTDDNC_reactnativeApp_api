import express from "express";
import { cancelOrderController, createOrderController, getMyOrdersController, getOrdersByStatusController, getSingleOrderDetailsController } from "../controllers/orderController.js";
import { isAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

//routes
//  ===================ORDER ROUTES==================

//CREATE ORDER
router.post("/create", isAuth, createOrderController)

//GET ALL ORDER
router.get("/my-orders", isAuth, getMyOrdersController)

//GET SINGLE ORDER DETAILS
router.get("/my-orders/:id", isAuth, getSingleOrderDetailsController)

//GET ORDERS BY STATUS
router.get("/status/:status", isAuth, getOrdersByStatusController)

//CANCEL ORDER
router.put("/cancel/:id", isAuth, cancelOrderController)

export default router;