import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import JWT from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: [true, 'email already taken']
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        minLength: [6, 'password length should be larger than 6 characters'],
    },
    address: {
        type: String,
        required: [true, 'address is required']
    },
    city: {
        type: String,
        required: [true, 'city name is required']
    },
    country: {
        type: String,
        required: [true, 'country name is required']
    },
    phone: {
        type: String,
        required: [true, 'phone no is required']
    },
    profilePic: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },
    role: {
        type: String,
        default: 'user',
        enum: ['admin', 'user', 'shopkeeper'],
    },
}, {timestamps: true});

//function
//hash func
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

//compare func
userSchema.methods.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password)
}

//JWT TOKEN
userSchema.methods.generateToken = function() {
    return JWT.sign(
        {
            _id: this._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

export const userModel = mongoose.model('User', userSchema);
export default userModel;