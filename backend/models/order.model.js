import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        minlength: 10,
    },
    region: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    deliveryPrice: {
        type: Number,
        required: true,
    },
    numOfItems: {
        type: Number,
        required: true,
    },
    productId: {
        type: String,
        required: true,
    },//product number
    notes: {
        type: String,
        required: false,
    },
},{timestamps: true})


const Order = mongoose.model("Order", orderSchema);

export default Order;