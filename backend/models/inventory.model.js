import mongoose from "mongoose";

const inventoryTransactionSchema = new mongoose.Schema({

    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
    },

    type:{
        type:String,
        enum:[
            "sale",
            "loss",
            "restock",
            "adjustment"
        ],
        required:true
    },

    quantity:{
        type:Number,
        required:true
    },

    costPerItem:{
        type:Number,
        required:true
    },

    totalCost:{
        type:Number,
        required:true
    },

    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order"
    },

    note:String

},{timestamps:true})

export default mongoose.model(
    "InventoryTransaction",
    inventoryTransactionSchema
)