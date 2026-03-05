import Category from "../models/category.model.js";


// Get All Categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (err) {
        console.error('Fetch categories error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create Category
export const createCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body;

        if (!name || !image) {
            return res.status(400).json({ error: 'Name and image are required' });
        }

        const newCategory = new Category({ name, description, image });
        await newCategory.save();

        res.status(201).json(newCategory);
    } catch (err) {
        console.error('Create category error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// controllers/category.controller.js
export const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, description, image } = req.body;

        if (!name || !image) {
            return res.status(400).json({ error: 'Name and image are required' });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { name, description, image },
            { new: true } // Return the updated document
        );

        if (!updatedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json(updatedCategory);
    } catch (err) {
        console.error('Update category error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// controllers/category.controller.js
export const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Delete category error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get Category by ID
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
