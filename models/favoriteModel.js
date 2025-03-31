import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
    product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
}, {timestamps: true});

//đảm bảo 1 user chỉ thích sản phẩm đó 1 lần
favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);