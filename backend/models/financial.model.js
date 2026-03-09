import mongoose from "mongoose";

const financialTransactionSchema = new mongoose.Schema({

    type:{
        type:String,
        enum:[
            "saleRevenue",
            "deliveryRevenue",
            "productCost",
            "loss",
            "expense"
        ],
        required:true
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