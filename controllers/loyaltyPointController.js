import { loyaltyPointModel } from "../models/loyaltyPointModel.js";

//ADD LOYALTY POINTS
export const addLoyaltyPointsController = async (req, res) => {
    try {
        const { user, points, action } = req.body;
        const userPoints = await loyaltyPointModel.findOne({user: user});
        if (!userPoints) {
            userPoints = await loyaltyPointModel.create({user, points: 0, history: []});
        }
        userPoints.points += points;
        userPoints.history.push({action, points});
        await userPoints.save();
        res.status(201).send({
            success: true,
            message: "Loyalty points added successfully",
            data: userPoints
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error adding loyalty points",
            error
        });
    }
}

//GET USER POINT
export const getUserPointsController = async (req, res) => {
    try {
        const { userId } = req.params;
        const userPoints = await loyaltyPointModel.findOne({user: userId});
        if (!userPoints) {
            return res.status(404).send({
                success: false,
                message: "No points found"
            });
        }
        res.status(200).send({
            success: true,
            message: "User points fetched successfully",
            data: userPoints
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error fetching user points",
            error
        });
    }
}