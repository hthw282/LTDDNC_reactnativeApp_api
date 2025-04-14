import productModel from "../models/productModel.js";

import cloudinary from "cloudinary";
import { getDataUri } from "./../utils/features.js";
import { voucherModel } from "../models/voucherModel.js";
import { commentModel } from "../models/commentMode.js";
import { loyaltyPointModel } from "../models/loyaltyPointModel.js";

// GET ALL PRODUCTS
export const getAllProductsController = async (req, res) => {
  const { keyword, category } = req.query;
  try {
    const products = await productModel
      .find({
        name: {
          $regex: keyword ? keyword : "",
          $options: "i",
        },
        category: category ? category : { $exists: true },
      })
      .populate("category");
    res.status(200).send({
      success: true,
      message: "all products fetched successfully",
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Get All Products API",
      error,
    });
  }
};

// GET TOP PRODUCT
export const getTopProductsController = async (req, res) => {
  try {
    const products = await productModel.find({}).sort({ rating: -1 }).limit(10);
    res.status(200).send({
      success: true,
      message: "top 10 products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Get TOP PRODUCTS API",
      error,
    });
  }
};

// GET SINGLE PRODUCT
export const getSingleProductController = async (req, res) => {
  try {
    // get product id
    const product = await productModel.findById(req.params.id);
    //valdiation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "product not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Product Found",
      product,
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
      message: "Error In Get single Products API",
      error,
    });
  }
};

// CREATE PRODUCT
export const createProductController = async (req, res) => {
  try {
    const { name, brand, description, price, specs, stock, category , releaseDate, features } = req.body;
    // validtion
    // if (!name || !description || !price || !stock) {
    //   return res.status(500).send({
    //     success: false,
    //     message: "Please Provide all fields",
    //   });
    // }
    if (!req.file) {
      return res.status(500).send({
        success: false,
        message: "please provide product images",
      });
    }
    const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    await productModel.create({
      name, brand, description, price, specs, stock, category, images: [image], releaseDate, features
    });

    res.status(201).send({
      success: true,
      message: "product Created Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Get single Products API",
      error,
    });
  }
};

// UPDATE PRODUCT
export const updateProductController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    //valdiatiuon
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    const { name, brand, description, price, discount, specs, stock, category, warranty, releaseDate, features } = req.body;
    // validate and update
    if (name) product.name = name;
    if (brand) product.brand = brand;
    if (description) product.description = description;
    if (price) product.price = price;
    if (discount) product.discount = discount;
    if (specs) product.specs = specs;
    if (stock) product.stock = stock;
    if (category) product.category = category;
    if (warranty) product.warranty = warranty;
    if (releaseDate) product.releaseDate = releaseDate;
    if (features) product.features = features;

    await product.save();
    res.status(200).send({
      success: true,
      message: "product details updated",
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
      message: "Error In Get UPDATE Products API",
      error,
    });
  }
};

// UPDATE PRODUCT IMAGE
export const updateProductImageController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    // valdiation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    // check file
    if (!req.file) {
      return res.status(404).send({
        success: false,
        message: "Product image not found",
      });
    }

    const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };
    // save
    product.images.push(image);
    await product.save();
    res.status(200).send({
      success: true,
      message: "product image updated",
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
      message: "Error In Get UPDATE Products API",
      error,
    });
  }
};

// DELETE PRODUCT IMAGE
export const deleteProductImageController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    // validating
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product Not Found",
      });
    }

    // image id find
    const id = req.query.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: "product image not found",
      });
    }

    let isExist = -1;
    product.images.forEach((item, index) => {
      if (item._id.toString() === id.toString()) isExist = index;
    });
    if (isExist < 0) {
      return res.status(404).send({
        success: false,
        message: "Image Not Found",
      });
    }
    // DELETE PRODUCT IMAGE
    await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
    product.images.splice(isExist, 1);
    await product.save();
    return res.status(200).send({
      success: true,
      message: "Product Image Deleted Successfully",
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
      message: "Error In Get DELETE Product IMAGE API",
      error,
    });
  }
};

// DELETE PRODUCT
export const deleteProductController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    // validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "product not found",
      });
    }
    // find and delete image cloudinary
    for (let index = 0; index < product.images.length; index++) {
      await cloudinary.v2.uploader.destroy(product.images[index].public_id);
    }
    await product.deleteOne();
    res.status(200).send({
      success: true,
      message: "PRoduct Deleted Successfully",
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
      message: "Error In Get DELETE Product IMAGE API",
      error,
    });
  }
};

// CREATE PRODUCT REVIEW AND COMMENT
export const productReviewController = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const userId = req.user._id;
    console.log("Product ID:", req.params.id);
    const product = await productModel.findById(req.params.id);
    //valdiation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "product not found",
      });
    }

    // check previous review
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).send({
        success: false,
        message: "Product Already Reviewed",
      });
    }
    // review object
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };
    // passing review object to reviews array
    product.reviews.push(review);
    // number or reviews
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;
    // save
    await product.save();

    // bonus after review
    let rewardMessage = "";

    if (rating >= 4) {
      const discountCode = `DISCOUNT-${Date.now()}`
      const newVoucher = new voucherModel({
        code: discountCode,
        discount: 10, //discount 10%
        minOrderValue: 1000000, //min total 1 milion
        expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      });

      await newVoucher.save();
      rewardMessage = `You have been rewarded with a 10% discount voucher. Use code: ${discountCode} at checkout.`
    } else {
      let userPoints = await loyaltyPointModel.findOne({ user: userId });
      if (!userPoints) {
        userPoints = new loyaltyPointModel({ user: userId, points: 0, history: [] });
        await userPoints.save();
      }

      const reviewPoints = 10;
      userPoints.points += reviewPoints;
      userPoints.history.push({ action: "Product Review", points: reviewPoints });
      
      await userPoints.save();
      rewardMessage = `Thank you for your review. You have recieved ${reviewPoints} loyalty points.`
    }
    res.status(200).send({
      success: true,
      message: "Review Added!",
      reward: rewardMessage,
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
      message: "Error In Review Comment API",
      error,
    });
  }
};

//GET REVIEWS BY PRODUCT
export const getProductReviewsController = async (req, res) => {
  try {
    const { productId } = req.params; 
    if (!productId) {
      return res.status(400).send({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await productModel.findById(productId).populate({
      path: "reviews.user", 
      select: "name",
    });
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // Kiểm tra nếu không có review
    if (product.reviews.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No reviews available for this product",
        reviews: [],
      });
    }

    res.status(200).send({
      success: true,
      message: "Reviews fetched successfully",
      totalReviews: product.reviews.length,
      reviews: product.reviews,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Get Reviews API",
      error,
    });
  }
}

// CREATE COMMENT
export const createCommentController = async (req, res) => {
  try {
    const {productId, comment} = req.body;

    //check if product exists
    const productExists = await productModel.findById(productId);
    if (!productExists) {
      return res.status(404).send({
        success: false,
        message: "Product not found"
      });
    }

    const newComment = new commentModel({
      user: req.user._id,
      product: productId,
      comment
    });

    await newComment.save();
    res.status(201).send({
      success: true,
      message: "Comment created successfully",
      data: newComment
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Comment API",
      error,
    });
  }
}

// GET ALL COMMENTS BY PRODUCT
export const getCommentsByProductController = async (req, res) => {
  try {
    const { productId } = req.params;
    const comments = await commentModel.find({ product: productId }).populate("user", "name");
    res.status(200).send({
      success: true,
      message: "Comments fetched successfully",
      totalComments: comments.length,
      comments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Get Comments API",
      error,
    });
  }
}

//DELETE COMMENT (THEIR OWN COMMENT OR ADMIN)
export const deleteCommentController = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await commentModel.findById(commentId);
    if (!comment) {
      return res.status(404).send({
        success: false,
        message: "Comment not found"
      });
    }
    
    if (comment.user.toString() !== req.user._id.toString()
      //  && req.user.role !== "admin"
      ) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized to delete comment"
      });
    }

    await comment.deleteOne();
    res.status(200).send({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Delete Comment API",
      error,
    });
  }
}

//get similar products
export const getSimilarProductsController = async (req, res) => {
  try {
    const {productId} = req.params;
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found"
      });
    }

    const products = await productModel.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(5);

    res.status(200).send({
      success: true,
      message: "Similar products fetched successfully",
      products
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Get Similar Products API",
      error
    });
  }
}

