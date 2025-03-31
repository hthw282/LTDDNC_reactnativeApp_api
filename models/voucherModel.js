import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'voucher code is required'],
        unique: [true, 'voucher code already taken']
    },
    discount: {
        type: Number,
        required: [true, 'discount is required']
    },
    minOrderValue: {
        type: Number,
        default: 0
    },
    expiryDate: {
        type: Date,
        required: [true, 'expiry date is required']
    },
    status: {
        type: Boolean,
        default: true
    } 
}, {timestamps: true});

export const voucherModel = mongoose.model("Voucher", voucherSchema);