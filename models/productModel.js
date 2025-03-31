import mongoose from "mongoose";

// REVIEW MODAL
const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is require"],
    },
    rating: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "user require"],
    },
  },
  { timestamps: true }
);

// PROCUCT MODAL
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "product name is required"],
    },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    description: {
      type: String,
      required: [true, "product description is required"],
    },
    price: {
      type: Number,
      required: [true, "product price is required"],
    },
    discount: { type: Number, default: 0 },
    specs: {
      screenSize: String,
      resolution: String,
      cpu: String,
      gpu: String,
      ram: Number,
      storage: Number,
      battery: String,
      os: String,
      weight: String,
    },
    stock: {
      type: Number,
      required: [true, "product stock required"],
    },
    // quantity: {
    //   type: Number,
    //   required: [true, "product quantity required"], 
    // },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    warranty: { type: String, default: "12 months" },
    releaseDate: { type: Date },
    features: [String],
  },
  { timestamps: true }
);

export const productModel = mongoose.model("Product", productSchema);
export default productModel;