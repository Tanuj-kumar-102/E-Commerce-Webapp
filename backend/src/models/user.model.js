import mongoose from "mongoose";

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
        }
    }, {timestamps: true});

    export const User = mongoose.model("User", userSchema);