import otpModel from '../models/otpModel.js';
import userModel from '../models/userModel.js'
import { getDataUri } from '../utils/features.js';
import cloudinary from 'cloudinary'
import nodemailer from 'nodemailer'

export const registerController = async (req, res) => {
    try {
        const {name, email, password, address, city, country, phone} = req.body
        //validation
        if (!name || !email || !password || !city || !address || !country || !phone) {
            return res.status(500).send({
                success: false,
                message: 'Please provide All fields',
            })
        }

        //check exisiting user
        const exisitingUSer = await userModel.findOne({ email });
        //validation
        if (exisitingUSer) {
        return res.status(500).send({
            success: false,
            message: "email already taken",
        });
        }

        const user = await userModel.create({
            name, email, password, address, city, country, phone
        })
        res.status(201).send({
            success:  true,
            message: 'Registeration success, redireted to login screen',
            user,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            succes: false,
            message: 'Error in Register API',
            error
        })
    }
};

const sendOTP = async(email, subject, text) => {
  // Xóa OTP cũ nếu có
  await otpModel.deleteMany({ email });

  // Tạo OTP mới
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Lưu OTP vào database
  await otpModel.create({ email, otp });

  // Cấu hình gửi email
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: subject,
    text: `${text}: ${otp}`,
  });
}

export const sendRegisterOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "Email already taken",
      });
    }
    await sendOTP(
      email,
      "Your OTP Code for Registration",
      "Your OTP code is"
    );
    
    res.status(200).send({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error sending OTP",
      error,
    });
  }
};


export const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Kiểm tra OTP
    const validOtp = await otpModel.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).send({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Xóa OTP sau khi xác thực thành công
    await otpModel.deleteOne({ email, otp });

    res.status(200).send({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error verifying OTP",
      error,
    });
  }
};

export const sendCheckOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await userModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).send({
        success: false,
        message: "Email not found",
      });
    }
    await sendOTP(
      email,
      "Your OTP Code",
      "Your OTP code is:"
    );
    
    res.status(200).send({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error sending OTP",
      error,
    });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
      const { email, newPassword } = req.body;

      // Tìm user bằng email
      const user = await userModel.findOne({ email });
      if (!user) {
          return res.status(404).send({ 
              success: false, 
              message: "User not found" 
          });
      }

      // Cập nhật mật khẩu mới
      user.password = newPassword;
      await user.save();

      res.status(200).send({ 
          success: true, 
          message: "Password reset successfully" 
      });
  } catch (error) {
      res.status(500).send({ 
          success: false, 
          message: "Error resetting password", 
          error 
      });
  }
};


export const loginController = async (req, res) => {
    try {
      const { email, password } = req.body;
      //validation
      if (!email || !password) {
        return res.status(500).send({
          success: false,
          message: "Please Add Email OR Password",
        });
      }
      // check user
      const user = await userModel.findOne({ email });
      //user valdiation
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "USer Not Found",
        });
      }
      //check pass
      const isMatch = await user.comparePassword(password);
      //valdiation pass
      if (!isMatch) {
        return res.status(500).send({
          success: false,
          message: "invalid credentials",
        });
      }
      //token
      const token = user.generateToken();
      res
        .status(200)
        .cookie('token', token, {
            expires: new Date(Date.now()+15*24*60*60*1000),
            secure: process.env.NODE_ENV === 'development' ? true : false,
            httpOnly: process.env.NODE_ENV === 'development' ? true : false,
            sameSite: process.env.NODE_ENV === 'development' ? true : false,
        })
        .send({
          success: true,
          message: "Login Successfully",
          token,
          user,
        });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: "false",
        message: "Error In Login Api",
        error,
      });
    }
  };
// GET USER PROFILE
export const getUserProfileController = async (req, res) => {
  try {
    const user = req.user; // Người dùng đã được gán từ middleware
    user.password = undefined;
    res.status(200).send({
      success: true,
      message: "USer Prfolie Fetched Successfully",
      user
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In PRofile API",
      error,
    });
  }
};

// LOGOUT
export const logoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Logout SUccessfully",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In LOgout API",
      error,
    });
  }
};

// UPDATE USER PROFILE
export const updateProfileController = async (req, res) => {
  try {
    const user = req.user; // Người dùng đã được gán từ middleware
    const { name, email, address, city, country, phone } = req.body;
    // validation + Update
    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (city) user.city = city;
    if (country) user.country = country;
    if (phone) user.phone = phone;
    //save user
    await user.save();
    res.status(200).send({
      success: true,
      message: "User Profile Updated",
      user, // Gửi lại thông tin cập nhật nếu cần
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In update profile API",
      error,
    });
  }
};

// update user passsword
export const updatePasswordController = async (req, res) => {
  try {
    // const user = await userModel.findById(req.user._id);
    const user = req.user; // Người dùng đã được gán từ middleware

    const { oldPassword, newPassword } = req.body;
    //valdiation
    if (!oldPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "Please provide old or new password",
      });
    }
    // old pass check
    const isMatch = await user.comparePassword(oldPassword);
    //validaytion
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid Old Password",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In update password API",
      error,
    });
  }
};
/// Update user profile photo
export const updateProfilePicController = async (req, res) => {
  try {
    console.log("📥 Received request to update profile picture"); // Log nhận request

    // Kiểm tra middleware Multer có nhận file không
    console.log("🖼️ File received from client:", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }
    // const user = req.user; // Người dùng đã được gán từ middleware
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // file get from client photo
    const file = getDataUri(req.file);
    console.log("🔄 Converted file to Data URI");
    // delete prev image
    await cloudinary.v2.uploader.destroy(user.profilePic.public_id);
    // update
    console.log("🚀 Uploading image to Cloudinary...");
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    console.log("✅ Cloudinary upload success:", cdb);
    user.profilePic = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    // save func
    await user.save();
    console.log("✅ User profile picture updated in database");

    res.status(200).send({
      success: true,
      message: "profile picture updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In update profile pic API",
      error,
    });
  }
};