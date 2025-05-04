import bannerModel from "../models/bannerModel.js";
import cloudinary from "cloudinary";
import { getDataUri } from "./../utils/features.js";

// CREATE BANNER
// (file: file, connerLabelColor: String, cornerLabelText: String)
export const createBannerController = async (req, res) => {
  try {
    const { connerLabelColor, cornerLabelText } = req.body;

    // if (!req.file) {
    //   return res.status(400).send({
    //     success: false,
    //     message: "Please provide banner image.",
    //   });
    // }

    // if (!connerLabelColor || !cornerLabelText) {
    //   return res.status(400).send({
    //     success: false,
    //     message: "Please provide corner label color and text.",
    //   });
    // }

    const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    await bannerModel.create({ image, connerLabelColor, cornerLabelText });
    res.status(201).send({
      success: true,
      message: "Banner created successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Create Banner API.",
      error,
    });
  }
};

// GET ALL BANNERS
export const getAllBannersController = async (req, res) => {
  try {
    const banners = await bannerModel.find({});
    res.status(200).send({
      success: true,
      message: "Banners Fetched Successfully",
      totalBanners: banners.length,
      banners,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Get All Banner API.",
      error,
    });
  }
};

// DELETE BANNER
export const deleteBannerController = async (req, res) => {
  try {
    const banner = await bannerModel.findById(req.params.id);
    if (!banner) {
      return res.status(404).send({
        success: false,
        message: "Banner not found.",
      });
    }

    // Delete image from cloudinary
    if (banner.image.public_id) {
      await cloudinary.v2.uploader.destroy(banner.image.public_id);
    }

    await bannerModel.deleteOne();
    res.status(200).send({
      success: true,
      message: "Banner Deleted Successfully.",
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In DELETE Banner API.",
      error,
    });
  }
};

// UPDATE BANNER
// (connerLabelColor: String, cornerLabelText: String, file: file - optional)
export const updateBannerController = async (req, res) => {
  try {
    const { connerLabelColor, cornerLabelText } = req.body;
    const banner = await bannerModel.findById(req.params.id);

    if (!banner) {
      return res.status(404).send({
        success: false,
        message: "Banner not found.",
      });
    }

    if (req.file) {
      // Delete old image from cloudinary
      if (banner.image.public_id) {
        await cloudinary.v2.uploader.destroy(banner.image.public_id);
      }
      // Upload new image
      const file = getDataUri(req.file);
      const cdb = await cloudinary.v2.uploader.upload(file.content);
      banner.image.public_id = cdb.public_id;
      banner.image.url = cdb.secure_url;
    }

    if (connerLabelColor) {
      banner.connerLabelColor = connerLabelColor;
    }
    if (cornerLabelText) {
      banner.cornerLabelText = cornerLabelText;
    }

    await banner.save();
    res.status(200).send({
      success: true,
      message: "Banner Updated Successfully.",
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In UPDATE Banner API.",
      error,
    });
  }
};