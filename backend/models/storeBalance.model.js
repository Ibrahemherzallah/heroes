import mongoose from "mongoose";

const storeBalanceSchema = new mongoose.Schema({

    currentBalance:{
        type:Number,
        required:true,
        default:0
    },

    startingBalance:{
        type:Number,
        required:true,
        default:0
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