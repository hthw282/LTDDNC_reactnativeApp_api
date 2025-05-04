import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    image: {
      public_id: String,
      url: String,
    },
    connerLabelColor: {
      type: String,
      required: true,
    },
    cornerLabelText: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const bannerModel = mongoose.model("Banner", bannerSchema);
export default bannerModel;