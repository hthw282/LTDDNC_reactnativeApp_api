import mongoose, { mongo } from "mongoose";
import { ViewedProductsModel } from "../models/viewedProducts.js";

export const addViewedProductController = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        let viewedProduct = await ViewedProductsModel.findOne({ user: userId });

        if (!viewedProduct) {
            //nếu chưa có, tạo mới danh sách
            viewedProduct = new ViewedProductsModel({
                user: userId,
                products: [{ product: productId, viewAt: Date.now() }],
            });
        } else {
            //nếu đã có, kiểm tra xem sản phẩm đã được xem trước đó chưa
            const existingProductIndex = viewedProduct.products.findIndex(
                (product) => product.product.toString() === productId
            );
            if (existingProductIndex !== -1) {
                // nếu đã có, cập nhật thời gian xem mới nhất
                viewedProduct.products[existingProductIndex].viewAt = Date.now();
            } else {
                // nếu chưa có, thêm sản phẩm vào danh sách
                viewedProduct.products.push({ product: productId, viewAt: Date.now() });
            }

            //danh sách chỉ chứa tối đa 10 sản phẩm
            if (viewedProduct.products.length > 10) {
                viewedProduct.products.shift();
            }
        }

        await viewedProduct.save();
        res.status(200).send({
            success: true,
            message: "Product added to viewed products successfully",
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error adding product to viewed products",
            error,
        });
    }
}

export const getViewedProductsController = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).send({
                success: false,
                message: "Unauthorized",
            });
        }
        const userId = new mongoose.Types.ObjectId(req.user._id); // Convert to ObjectId
        const viewedProducts = await ViewedProductsModel.findOne({ user: userId })
            .populate("products.product", "name price image")
            .sort({ "products.viewAt": -1 });
        
        res.status(200).send({
            success: true,
            message: "Viewed products fetched successfully",
            viewedProducts: viewedProducts ? viewedProducts.products : [],
        });
    } catch (error) {
        console.error("Error fetching viewed products:", error);
        res.status(500).send({
            success: false,
            message: "Error fetching viewed products",
            error,
        });
    }
}