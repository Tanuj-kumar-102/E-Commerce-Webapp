import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const addressSchema = new mongoose.Schema(
    {
        countary: {
            type: String
        },
        state: {
            type: String
        },
        district: {
            type: String
        },
        tehsil: {
            type: String
        },
        village: {
            type: String
        },
        houseNo: {
            type: String
        },
        pincode: {
            type: Number
        }
    });

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            lowercase: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: Number,
            unique: true
        },
        address: {
            type: [addressSchema]
        },
        avtar: {
            type: String,
        },
        order: {
            type: [ mongoose.Schema.Types.ObjectId ],
            ref: "Product"
        },
        refreshToken: {
            type: String
        }
    }, {timestamps: true});

    userSchema.pre("save", async function(next) {
        if(!this.isModified("password")) return next();
        this.password = await bcrypt.hash(this.password, 10);
        next();
    })

    userSchema.methods.isPasswordCorrect = async function(password) {
        return await bcrypt.compare(password, this.password);
    }

    userSchema.methods.generateAccessToken = function () {
        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                fullName: this.fullName
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        )
    }

    userSchema.methods.generateRefreshToken = function(){
        return jwt.sign(
            {
                _id: this._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        )
    }

    export const User = mongoose.model("User", userSchema);