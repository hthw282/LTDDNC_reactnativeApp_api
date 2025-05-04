import orderModel from "../models/orderModel.js"
import productModel from "../models/productModel.js"
import cron from "node-cron"
import mongoose from "mongoose";
// xác nhận đơn hàng sau 30 phút nếu shop chưa xác nhận
cron.schedule("*/5 * * * *", async () => { 
    const timeLimit = new Date(Date.now() - 30 * 60 * 1000);
    
    await orderModel.updateMany(
        { orderStatus: "new", orderCreatedAt: { $lte: timeLimit } },
        { orderStatus: "confirmed" }
    );
    console.log("✅ Updated automatically order status into confirm after 30 mins");
});

//CREATE CONTROLLER
export const createOrderController = async (req, res) => {
    try {
        const {
            shippingInfo,
            orderItems,
            paymentMethod,
            paymentInfo, 
            itemPrice,
            tax,
            shippingCharges,
            totalAmount,
        } = req.body
        //validation
        //create order
        await orderModel.create({
            user: req.user._id,
            shippingInfo,
            orderItems,
            paymentMethod,
            paymentInfo, 
            itemPrice,
            tax,
            shippingCharges,
            totalAmount,
            orderCreatedAt: new Date(),
        })

        //stock update
        for(let i=0; i < orderItems.length; i++) {
            //find product
            const product = await productModel.findById(orderItems[i].product)
            product.stock -= orderItems[i].quantity
            await product.save()
        }
        res.status(201).send({
            success: true,
            message: "Order placed successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in create order API',
            error,
        })
    }
}

//GET ALL ORDERS (MY ORDERS)
export const getMyOrdersController = async (req, res) => {
    try {
        //find order
        const orders = await orderModel.find({user: req.user._id})
        //validiation
        if (!orders) {
            return res.status(404).send({
                success: false,
                message: "no orders found"
            })
        }
        res.status(200).send({
            success: true,
            message: "your orders data",
            totalOrder: orders.length,
            orders,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in my orders API',
            error,
        })
    }
}

export const getSingleOrderDetailsController = async (req, res) => {
    try {
        //find order and populate orderItems.product
        const order = await orderModel.findById(req.params.id)
            .populate({
                path: 'orderItems.product',
                model: 'Product',
                populate: {
                    path: 'reviews.user',
                    model: 'User',
                    select: 'name', 
                },
            })
            .populate('user', 'name email')
            // .populate('shippingInfo.user', 'name city country address postalCode phone') 
            .exec();

        //validation
        if (!order) {
            return res.status(404).send({
                success: false,
                message: 'no order found',
            });
        }

        res.status(200).send({
            success: true,
            message: 'your order fetched',
            order,
        });
    } catch (error) {
        console.log(error);
        if (error.name === "CastError") {
            return res.status(500).send({
                success: false,
                message: "Invalid Id",
            });
        }
        res.status(500).send({
            success: false,
            message: 'Error in orders details API',
            error,
        });
    }
};

//GET ORDERS BY STATUS
export const getOrdersByStatusController = async (req, res) => {
    try {
        const {status} = req.params
        const validStatuses = ['new', 'confirmed', 'preparing', 'delivering','delivered', 'canceled']
        if (!validStatuses.includes(status)) {
            return res.status(404).send({
                success: false,
                message: 'Invalid order status'
            })
        }
        const orders = await orderModel.find({orderStatus: status}).populate("user", "name email")
        res.status(200).send({
            success: true,
            message: "your orders data",
            totalOrder: orders.length,
            orders,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in get orders by status API',
            error,
        })
    }
}

// CANCEL ORDER
export const cancelOrderController = async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.id);

        if (!order) {
            return res.status(404).send({
                success: false,
                message: 'Invalid order'
            })
        }

        const now = new Date();
        const timeDiff = now - order.orderCreatedAt; // thời gian đã qua
        const timeLimit = 30 * 60 * 1000; // 30m

        // nếu trong vòng 30m thì cho phép huỷ
        if (timeDiff <= timeLimit) {
            order.orderStatus = "canceled";
            await order.save();
            return res.status(200).send({
                success: true,
                message: "Your order is succesfully canceled"
            });
        } 
        
        // nếu đã sang bước `preparing`, gửi yêu cầu cho shop
        if (order.orderStatus === "preparing") {
            return res.status(403).send({ 
                success: false,
                message: "Your order is prepared, this require will forward to shop for next action." 
            });
        }

        return res.status(403).send({ 
            success: false,
            message: "You can not canceled order after 30 minutes" 
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server", error });
    }
};

//count total purchases for a product
export const countTotalPurchasesForProductController = async (req, res) => {
    try {
        const { productId } = req.params;

        //convert string to ObjectId
        const productIdObject = new mongoose.Types.ObjectId(productId);

        const orders = await orderModel.find({
            "orderItems.product": productIdObject,
            orderStatus: "delivered",
        }); 

        // đếm tổng số lần sản phẩm được mua
        let totalPurchases = 0;
        orders.forEach(order => {
            order.orderItems.forEach(item => {
                if (item.product.equals(productIdObject)) {
                    totalPurchases += Number(item.quantity); // cộng tổng số lượng sản phẩm đã mua
                }
            });
        });

        res.status(200).send({
            success: true,
            message: "Total purchases counted successfully",
            totalPurchases
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error In Get Buyers Count API",
            error,
        });
    }
};

// =========== ADMIN PANEL =========== //
// GET ALL ORDERS
export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({}).populate("user", "name email").sort({createdAt: -1})
        res.status(200).send({
            success: true,
            message: "All orders fetched successfully",
            totalOrders: orders.length,
            orders,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in get all orders API',
            error,
        })
    }
}

// CHANGE ORDER STATUS
export const changeOrderStatusController = async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.id);

        if (!order) {
            return res.status(404).send({
                success: false,
                message: 'Invalid order'
            })
        }
        if (order.orderStatus === "new") {
            order.orderStatus = "confirmed";
        } else if (order.orderStatus === "confirmed") {
            order.orderStatus = "preparing";
        }
        else if (order.orderStatus === "preparing") {
            order.orderStatus = "delivering";
        } else if (order.orderStatus === "delivering") {
            order.orderStatus = "delivered";
            order.deliverAt = new Date().now();
        } else if (order.orderStatus === "delivered") {
            return res.status(500).send({
                success: false,
                message: 'Order already delivered'
            })
        } else if (order.orderStatus === "canceled") {
            return res.status(500).send({
                success: false,
                message: 'Order already canceled'
            })
        }

        await order.save();

        res.status(200).send({
            success: true,
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        console.log(error)
        if (error.name === "CastError") {
            return res.status(500).send({
                success: false,
                message: "Invalid Id",
            })
        }
        res.status(500).send({
            success: false,
            message: 'Error in change order status API',
            error,
        })
    }
}

// export const getFinancialReportController = async (req, res) => {
//     try {
//         const { startDate, endDate } = req.body;
//         const orders = await orderModel.find({
//             orderCreatedAt: {
//                 $gte: new Date(startDate),
//                 $lte: new Date(endDate),
//             },
//         });

//         let totalSales = 0;
//         let totalOrders = 0;

//         orders.forEach(order => {
//             totalSales += order.totalAmount;
//             totalOrders += 1;
//         });

//         res.status(200).send({
//             success: true,
//             message: "Financial report fetched successfully",
//             totalSales,
//             totalOrders,
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             success: false,
//             message: "Error in financial report API",
//             error,
//         });
//     }
// }

export const getFinancialSummaryByUserController = async (req, res) => {
    try {
        const { id } = req.params;
        
        const orders = await orderModel.find({user: id})

        if (!orders) {
            return res.status(404).send({
                success: false,
                message: "No orders found for this user",
                totalOrders: 0,
                totalSpent: 0,
                byStatus: {
                }
            })
        }

        const byStatus = {
            new: {totalAmount: 0, count: 0},
            confirmed: {totalAmount: 0, count: 0},
            preparing: {totalAmount: 0, count: 0},
            delivering: {totalAmount: 0, count: 0},
            delivered: {totalAmount: 0, count: 0},
            canceled: {totalAmount: 0, count: 0},
        };

        let totalOrders = 0;
        let totalSpent = 0;

        for (const order of orders) {
            const status = order.orderStatus;
            const amount = order.totalAmount || 0;

            totalOrders++;

            //chỉ cộng tiền cho các đơn hàng đã giao
            if (status === "delivered") {
                totalSpent += amount;
            }

            if (byStatus[status]) {
                byStatus[status].totalAmount += amount;
                byStatus[status].count += 1;
            }
        }

        res.status(200).send({
            success: true,
            message: "Financial summary fetched successfully",
            totalOrders,
            totalSpent,
            byStatus,
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in financial summary API",
            error,
        });
    }
}