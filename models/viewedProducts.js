import mongoose from "mongoose";

const viewedProductsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            viewAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

export const ViewedProductsModel = mongoose.model("ViewedProduct", viewedProductsSchema);
