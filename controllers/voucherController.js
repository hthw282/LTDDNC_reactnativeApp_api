import { voucherModel } from "../models/voucherModel.js";

//CREATE VOUCHER
export const createVoucherController = async (req, res) => {
    try {
        const { code, discount, minOrderValue, expiryDate } = req.body;
        
        const existingVoucher = await voucherModel.findOne({ code });
        if (existingVoucher) {
            return res.status(400).send({
                success: false,
                message: "Voucher code already exists"
            });
        }
        await voucherModel.create({code, discount, minOrderValue, expiryDate });

        res.status(201).send({
            success: true,
            message: "Voucher created successfully",
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error creating voucher",
            error
        });
    }
}

//GET ALL VOUCHERS
export const getAllVouchersController = async (req, res) => {
    try {
        const vouchers = await voucherModel.find();
        res.status(200).send({
            success: true,
            message: "Vouchers Fetch Successfully",
            totalVouchers: vouchers.length,
            vouchers,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error In Get All Voucher API",
            error,
        });
    }
};

//DELETE VOUCHER
export const deleteVoucherController = async (req, res) => {
    try {
        const { id } = req.params;
        await voucherModel.findByIdAndDelete(id);
        res.status(200).send({
            success: true,
            message: "Voucher deleted successfully"
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error deleting voucher",
            error
        });
    }
};


