import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true, min: 1 },
            // selectedOptions: { type: mongoose.Schema.Types.Mixed, default: {}
        }
    ]
}, { timestamps: true });

export const CartModel = mongoose.model("Cart", cartSchema);
