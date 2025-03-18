import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: [true, "brand  is required"],
    },
    image: {
      public_id: String,
      url: String,
    },
    categories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        }
    ]
  },
  { timestamps: true }
);

export const brandModel = mongoose.model("Brand", brandSchema);
export default brandModel;