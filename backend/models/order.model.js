import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({

    orderType: {
        type: String,
        enum: ["store", "whatsapp", "loss", "website"],
        default: "website"
    },

    region: {
        type: String,
        required: function () {
            console.log("this.orderType os" , this.orderType)
            return this.orderType === "whatsapp" || this.orderType === "website";
        },
    },

    city: {
        type: String,
        required: function () {
            return this.orderType === "whatsapp" || this.orderType === "website";
        },
    },

    fullName: {
        type: String,
        required: function () {
            return this.orderType === "whatsapp" || this.orderType === "website";
        },
    },

    phoneNumber: {
        type: String,
        minlength: 10,
        required: function () {
            return this.orderType === "whatsapp" || this.orderType === "website";
        },
    },

    price: {
        type: Number,
        required: true,
    },

    deliveryPrice: {
        type: Number,
        required: function () {
            return this.orderType === "whatsapp" || this.orderType === "website";
        },
    },

    // NEW
    pricingType: {
        type: String,
        enum: ["standard", "custom"],
        default: "standard"
    },

    // NEW
    profit: {
        type: Number,
        default: 0
    },

    // NEW
    lossReason: {
        type: String
    },

    status: {
        type: String,
        enum: ['ordered', 'shipped', 'delivered'],
        default: 'ordered',
    },

    shippedAt: {
        type: Date,
    },

    deliveredAt: {
        type: Date,
    },

    source: {
        type: String,
        enum: ['زائر','تاجر','زبون','ادمن','متجر']
    },

    orderNumber: {
        type: Number,
        required: false,
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    usedPoints: {
        type: Number,
        required: false,
    },

    products: [
        {
            productId: String,
            name: String,
            image: String,
            price: Number,
            originalPrice: Number,
            quantity: {
                type: Number,
                required: true,
            },
            source: String,
        },
    ],
    notes: {
        type: String,
        required: false,
    },

},{timestamps: true})


const Order = mongoose.model("Order", orderSchema);

export default Order;