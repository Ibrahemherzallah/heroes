import HeroSlide from "../models/heroSlide.model.js";

// GET all active slides for public homepage
export const getHeroSlides = async (req, res) => {
    try {
        const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1, createdAt: -1 });

        res.json({
            slides,
        });
    } catch (error) {
        console.error("Get hero slides error:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
};

// GET all slides for admin
export const getAllHeroSlides = async (req, res) => {
    try {
        const slides = await HeroSlide.find().sort({ order: 1, createdAt: -1 });

        res.json({
            slides,
        });
    } catch (error) {
        console.error("Get all hero slides error:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
};

// CREATE new slide
export const createHeroSlide = async (req, res) => {
    try {
        const { title, subtitle, image, order, isActive } = req.body;

        if (!title || !image) {
            return res.status(400).json({
                error: "Title and image are required",
            });
        }

        const newSlide = await HeroSlide.create({
            title,
            subtitle: subtitle || "",
            image,
            order: typeof order === "number" ? order : Number(order) || 0,
            isActive: typeof isActive === "boolean" ? isActive : true,
        });

        res.status(201).json({
            message: "Hero slide created successfully",
            slide: newSlide,
        });
    } catch (error) {
        console.error("Create hero slide error:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
};

export const updateHeroSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subtitle, image, order, isActive } = req.body;

        const slide = await HeroSlide.findById(id);

        if (!slide) {
            return res.status(404).json({
                error: "Hero slide not found",
            });
        }

        slide.title = title ?? slide.title;
        slide.subtitle = subtitle ?? slide.subtitle;
        slide.image = image ?? slide.image;
        slide.order = typeof order === "number" ? order : Number(order) || slide.order;
        slide.isActive =
            typeof isActive === "boolean" ? isActive : slide.isActive;

        await slide.save();

        res.json({
            message: "Hero slide updated successfully",
            slide,
        });
    } catch (error) {
        console.error("Update hero slide error:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
};

// DELETE slide
export const deleteHeroSlide = async (req, res) => {
    try {
        const { id } = req.params;

        const slide = await HeroSlide.findById(id);

        if (!slide) {
            return res.status(404).json({
                error: "Hero slide not found",
            });
        }

        await slide.deleteOne();

        res.json({
            message: "Hero slide deleted successfully",
        });
    } catch (error) {
        console.error("Delete hero slide error:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
};