import mongoose from "mongoose";

const financialTransactionSchema = new mongoose.Schema({

    type: {
        type: String,
        enum: [
            "openingBalance",
            "capitalInjection",
            "withdrawal",
            "manualRevenue",
            "saleRevenue",
            "deliveryRevenue",
            "productCost",
            "loss",
            "expense",
            "orderReturn",
            "deliveryReturn"
        ],
        required: true
    },
    category: {
        type: String,
        enum: [
            "rent",
            "salaries",
            "utilities",
            "transport",
            "marketing",
            "supplies",
            "maintenance",
            "other"
        ],
        default: "other"
    },
    amount:{
        type:Number,
        required:true
    },

    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order"
    },

    description:String

},{timestamps:true})

export default mongoose.model(
    "FinancialTransaction",
    financialTransactionSchema
)