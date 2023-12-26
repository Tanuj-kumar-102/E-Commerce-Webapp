import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Type.ObjectId,
        ref: "Product"
    },
    quantity: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    orderPprice: {
        type: Number,
        required: true
    },
    orderItems: [{
        type: orderItemSchema
    }],
    customer: {
        type: mongoose.Schema.Type.ObjectId,
        ref: "User",
        required: true
    },
    address: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "CANCELLED", "DELIVERED"],
        default: "PENDING"
    }
}, {timestamps: true});

export const Order = mongoose.model("Order", orderSchema);