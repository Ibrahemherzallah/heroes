import mongoose from "mongoose";

const heroSlideSchema = new mongoose.Schema(
    {
        linkUrl: {
            type: String,
            required: true,
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