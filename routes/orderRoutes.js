import express from "express";
import { cancelOrderController, createOrderController, getAllOrdersController, getMyOrdersController, getOrdersByStatusController, getSingleOrderDetailsController, changeOrderStatusController, getFinancialSummaryByUserController } from "../controllers/orderController.js";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";

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

router.get("/financial-summary/:id", isAuth, getFinancialSummaryByUserController)
//  ===================ÀDMIN ROUTES==================
//GET ALL ORDERS FOR ADMIN
router.get("/admin/get-all-orders", isAuth, isAdmin, getAllOrdersController)

//change order status
router.put("/admin/order/:id", isAuth, isAdmin, changeOrderStatusController)
export default router;