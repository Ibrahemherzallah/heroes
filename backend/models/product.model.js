import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    image: {
        type: [String],
        required: true
    },
    customerPrice: {
        type: Number,
        required: true,
    },
    salePrice: {
        type: Number,
        required: false,
    },
    isSoldOut: {
        type: Boolean,
        required: false,
        default: false
    },
    isOnSale: {
        type: Boolean,
        required: false,
        default: false
    },
    description: {
        type: String,
        default: "",
        required: false,
    },
    url: {
        type: String
    },
    properties: [{
        type: String
    }],
    sortOrder: { type: Number, default: 0 },
},{timestamps: true})


const Product = mongoose.model("Product", productSchema);

export default Product;