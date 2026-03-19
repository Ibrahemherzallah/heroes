import mongoose from "mongoose";

const heroSlideSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        subtitle: {
            type: String,
            default: "",
            trim: true,
        },
        image: {
            type: String,
            required: true,
            trim: true,
        },
        mobileImage: {
            type: String,
            required: true,
            trim: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("HeroSlide", heroSlideSchema);