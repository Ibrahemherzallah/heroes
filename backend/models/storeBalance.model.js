import mongoose from "mongoose";

const storeBalanceSchema = new mongoose.Schema({

    currentBalance:{
        type:Number,
        required:true,
    },

    startingBalance:{
        type:Number,
        required:true,
    },

    currency:{
        type:String,
        default:"ILS"
    }

},{timestamps:true})

export default mongoose.model(
    "StoreBalance",
    storeBalanceSchema
)