import brandModel from "../models/brandModel.js";
import productModel from "../models/productModel.js";

import cloudinary from "cloudinary";
import { getDataUri } from "./../utils/features.js";

// CREATE BRAND
// (brand: String, categories , file: file)
export const createBrand = async (req, res) => {
  try {
    const { brand, categories } = req.body;
    // validation
    // if (!brand || !categories) {
    //   return res.status(404).send({
    //     success: false,
    //     message: "please provide all fields",
    //   });
    // }
    // if (!req.file) {
    //     return res.status(500).send({
    //       success: false,
    //       message: "please provide brand images",
    //     });
    //   }
    
    const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
        public_id: cdb.public_id,
        url: cdb.secure_url,
      };

    await brandModel.create({ brand, image, categories });
    res.status(201).send({
      success: true,
      message: `${brand} brand created successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Create Cat API",
      error,
    });
  }
};

// GET ALL CAT
export const getAllBrandsController = async (req, res) => {
  try {
    const brands = await brandModel.find({}).populate("categories");
    res.status(200).send({
      success: true,
      message: "Brands Fetch Successfully",
      totalBrands: brands.length,
      brands,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Get All Brand API",
      error,
    });
  }
};

// DELETE BRAND
export const deleteBrandController = async (req, res) => {
  try {
    // find brand
    const brand = await brandModel.findById(req.params.id);
    //validation
    if (!brand) {
      return res.status(404).send({
        success: false,
        message: "brand not found",
      });
    }
    // find product with this brand id
    const products = await productModel.find({ brand: brand._id });
    // update producty brand
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.brand = undefined;
      await product.save();
    }
    // Delete image from cloudinary
    if (brand.image.public_id) {
      await cloudinary.v2.uploader.destroy(brand.image.public_id);
    }
    // save
    await brand.deleteOne();
    res.status(200).send({
      success: true,
      message: "brand Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    // cast error ||  OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In DELETE brand API",
      error,
    });
  }
};

// UDPATE BRAND
// (brand: String)
export const updateBrandController = async (req, res) => {
  try {
    const { brand: updatedBrand, categories } = req.body;
    // find brand
    const brand = await brandModel.findById(req.params.id);
    //validation
    if (!brand) {
      return res.status(404).send({
        success: false,
        message: "brand not found",
      });
    }

    // find product with this brand id
    const products = await productModel.find({ brand: brand._id });
    // update producty brand
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.brand = updatedBrand;
      await product.save();
    }
    if (updatedBrand) {
        brand.brand = updatedBrand;
    }
    if (categories) {
      brand.categories = categories;
    }
    // save
    await brand.save();
    res.status(200).send({
      success: true,
      message: "brand Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    // cast error ||  OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In UPDATE brand API",
      error,
    });
  }
};