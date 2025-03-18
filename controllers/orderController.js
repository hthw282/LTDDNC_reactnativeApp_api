import orderModel from "../models/orderModel.js"
import productModel from "../models/productModel.js"
import cron from "node-cron"

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

//GET SINGLE ORDER DETAILS
export const getSingleOrderDetailsController = async (req, res) => {
    try {
        //find orders
        const order = await orderModel.findById(req.params.id)
        //validation
        if (!order) {
            return res.status(404).send({
                success: false,
                message: 'no order found'
            })
        }
        res.status(200).send({
            success: true,
            message: 'your order fetched',
            order,
        })
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
            message: 'Error in orders details API',
            error,
        })
    }
}

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