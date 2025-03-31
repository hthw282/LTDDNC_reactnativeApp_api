import mongoose from "mongoose";
import favoriteModel from "../models/favoriteModel.js";
import productModel from "../models/productModel.js";

//add product to favorite
export const addToFavorite = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;
        
        if (!productId) {
            return res.status(400).send({
                success: false,
                message: "Product ID is required"
            });
        }
        // check if product is not objectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({
                success: false,
                message: "Invalid product ID"
            });
        }

        // chẹc if product is valid
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).send({
                success: false,
                message: "Product not found"
            });
        }
        // check if product is already in favorite
        const existingFavorite = await favoriteModel.findOne({user: userId, product: productId});
        if (existingFavorite) {
            return res.status(400).send({
                success: false,
                message: "Product is already in favorite"
            });
        }

        const favorite = new favoriteModel({user: userId, product: productId});
        await favorite.save();

        res.status(201).send({
            success: true,
            message: "Product added to favorite",
            favorite,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error adding to favorite",
            error
        });
    }    
};

//delete product from favorite
export const deleteFromFavorite = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const favorite = await favoriteModel.findOne({user: userId, product: productId}); 
        if (!favorite) {
            return res.status(404).send({
                success: false,
                message: "Product not found in favorite"
            });
        }  
        await favoriteModel.findOneAndDelete({user: userId, product: productId});

        res.status(200).send({
            success: true,
            message: "Product deleted from favorite"
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error deleting product from favorite",
            error
        });
    }
};

//get list of favorite products by user
export const getUserFavorites = async (req, res) => {
    try {
        const userId = req.user._id;

        const favoriteProducts = await favoriteModel.find({user: userId})
        .populate({
            path: "product",
            select: "name price image category",
            options: { strictPopulate: false },
        });
        // const favoriteProducts = await favoriteModel.find({ user: userId });
        
        res.status(200).send({
            success: true,
            message: "Favorite products fetched",
            totalFavoriteProducts: favoriteProducts.length,
            favoriteProducts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error fetching favorite products",
            error
        });
    }
};

