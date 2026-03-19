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
// CREATE new slide
export const createHeroSlide = async (req, res) => {
    try {
        const {
            title,
            subtitle,
            image,
            mobileImage,
            order,
            isActive
        } = req.body;

        if (!title || !image) {
            return res.status(400).json({
                error: "Title and desktop image are required",
            });
        }

        const newSlide = await HeroSlide.create({
            title: title.trim(),
            subtitle: subtitle?.trim() || "",
            image,
            mobileImage: mobileImage || "",
            order: Number(order) || 0,
            isActive:
                typeof isActive === "boolean"
                    ? isActive
                    : isActive === "false"
                        ? false
                        : true,
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
        const {
            title,
            subtitle,
            image,
            mobileImage,
            order,
            isActive
        } = req.body;

        const slide = await HeroSlide.findById(id);

        if (!slide) {
            return res.status(404).json({
                error: "Hero slide not found",
            });
        }

        if (typeof title !== "undefined") {
            slide.title = title.trim();
        }

        if (typeof subtitle !== "undefined") {
            slide.subtitle = subtitle?.trim() || "";
        }

        if (typeof image !== "undefined") {
            slide.image = image;
        }

        if (typeof mobileImage !== "undefined") {
            slide.mobileImage = mobileImage;
        }

        if (typeof order !== "undefined") {
            slide.order = Number(order) || 0;
        }

        if (typeof isActive !== "undefined") {
            slide.isActive =
                typeof isActive === "boolean"
                    ? isActive
                    : isActive === "false"
                        ? false
                        : true;
        }

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