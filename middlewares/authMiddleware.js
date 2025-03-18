import JWT from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export const isAuth = async (req, res, next) => {
    let token = req.cookies?.token; // Lấy token từ cookie

    // Nếu không có token trong cookie, kiểm tra trong Authorization header
    if (!token && req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1]; // Lấy token sau "Bearer "
    }

    // Nếu vẫn không có token, trả về lỗi
    if (!token) {
        return res.status(401).send({
            success: false,
            message: 'Unauthorized User'
        });
    }

    try {
        // Giải mã token
        const decodeData = JWT.verify(token, process.env.JWT_SECRET);
        
        // Lấy thông tin người dùng từ database
        req.user = await userModel.findById(decodeData._id);

        if (!req.user) {
            return res.status(404).send({
                success: false,
                message: 'User not found'
            });
        }

        console.log('Token:', token); // Log token
        console.log('Decoded Data:', decodeData); // Log dữ liệu đã giải mã
        
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).send({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};
