import jwt from "jsonwebtoken";
import userModel from '../models/userModel.js';

export const isAuth = async (req, res, next) => {
    // let token = req.cookies?.token; // Lấy token từ cookie

    // // Nếu không có token trong cookie, kiểm tra trong Authorization header
    // if (!token && req.headers.authorization) {
    //     token = req.headers.authorization.split(" ")[1]; // Lấy token sau "Bearer "
    // }
    

    // const token = req.headers.authorization?.split(" ")[1];

    const tokenWithBearer = req.headers.authorization;
    console.log("Authorization Header:", tokenWithBearer); // Thêm dòng này
    const token = tokenWithBearer?.split(" ")[1];
    
    // Nếu vẫn không có token, trả về lỗi
    if (!token) {
        return res.status(401).send({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "TokenExpiredError", expiredAt: err.expiredAt });
        }
        req.user = decoded;
        next();
      });
    
};

export const isAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(401).send({
            success: false,
            message: 'Access denied. Admins only.'
        });
    }
    next();
}