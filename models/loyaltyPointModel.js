import mongoose from "mongoose";

const loyaltyPointSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    points: {
        type: Number,
        default: 0,
    },
    history: [
        {
            action: {
                type: String,
            },
            points: {
                type: Number,
            },
            date: {
                type: Date,
                default: Date.now,
            },
        }
    ]
}, {timestamps: true});

export const loyaltyPointModel = mongoose.model("LoyaltyPoint", loyaltyPointSchema);