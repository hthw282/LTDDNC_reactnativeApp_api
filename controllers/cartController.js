import mongoose, { mongo } from "mongoose";
import { CartModel } from "../models/cartModel.js";

export const updateCartController = async (req, res) => {
    const { userId, items } = req.body;

    console.log("updateCartController - userId:", userId);
    console.log("updateCartController - items:", items);

    try {    
        // Tìm giỏ hàng của người dùng
        let cart = await CartModel.findOne({ user: userId });

        if (!cart) {
            console.log("Creating new cart for userId:", userId);

            // Nếu không có giỏ hàng, tạo mới
            cart = new CartModel({ user: userId, items });
            console.log("Creating new cart:", cart);
        }
        else {
            // Nếu có giỏ hàng, cập nhật danh sách sản phẩm
            console.log("Updating existing cart for userId:", userId);
            console.log("Previous cart items:", cart.items);
            cart.items = items;
            console.log("New cart items:", cart.items);
        }

        await cart.save();

        res.status(200).send({
            success: true,
            message: "Update cart successfully",
            cart,
        });
    } catch (error) {
        console.error("Error in updateCartController:", error);
        res.status(500).send({
            success: false,
            message: "Error updating cart",
            error,
        });
    }
}

export const getCartController = async (req, res) => {
    const { userId } = req.params;

    try {
        const cart = await CartModel.findOne({ user: userId }).populate("items.product", "name price images description rating numReviews stock");

        if (!cart) {
            return res.status(404).send({
                success: false,
                message: "Cart not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "Get cart successfully",
            cart,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error getting cart",
            error,
        });
    }
}
