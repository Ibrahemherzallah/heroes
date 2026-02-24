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
    wholesalerPrice: {
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
    sortOrder: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        enum: ['inStore', 'sourced'],
        required: true,
        default: 'inStore'
    },
    stock: {
        type: Number,
        required: function() { return this.type === 'inStore'; },
    }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;