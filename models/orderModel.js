import { truncates } from "bcryptjs";
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        shippingInfo: {
            address: {
                type: String,
                required: [true, 'address is required']
            },
            city: {
                type: String,
                required: [true, 'city is required']
            },
            country: {
                type: String,
                required: [true, 'country is required']
            }
        },
        orderItems: [
            {
                name: {
                    type: String,
                    required: [true, 'product name is required']
                },
                price: {
                    type: String,
                    required: [true, 'product price is required']
                },
                quantity: {
                    type: String,
                    required: [true, 'product quantity is required']
                },
                image: {
                    type: String,
                    required: [true, 'product image is required']
                },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                }
            }
        ],
        paymentMethod: {
            type: String,
            enum: ["COD", "ONLINE"],
            default: "COD"
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'user id is required']
        },
        paidAt: Date,
        paymentInfo: {
            id: String,
            status: String
        },
        itemPrice: {
            type: Number,
            required: [true, 'item price is required']
        },
        tax: {
            type: Number,
            required: [true, 'tax price is required']
        },
        shippingCharges: {
            type: Number,
            required: [true, 'item shippingCharges is required']
        },
        totalAmount: {
            type: Number,
            required: [true, 'item totalAmount is required']
        },
        orderStatus: {
            type: String,
            enum: ['new', 'confirmed', 'preparing', 'delivering','delivered', 'canceled'],
            default: 'new'
        },
        deliverAt: Date,
        orderCreatedAt: { 
            type: Date, 
            default: Date.now 
        }
    },
    { timestamps: true}
);

export const orderModel = mongoose.model("Order", orderSchema)
export default orderModel