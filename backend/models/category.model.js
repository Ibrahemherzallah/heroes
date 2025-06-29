import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    categoryName: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
        type: String,
        required: false
    }
},{timestamps: true})


const Category = mongoose.model("Category", categorySchema);

export default Category;