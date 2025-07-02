// controllers/productController.js
import Product from "../models/product.model.js";

// Create Product

export const createProduct = async (req, res) => {
    try {
        const {
            productName,
            id,
            categoryId,
            image, // array of image URLs
            customerPrice,
            salePrice,
            isOnSale,
            isSoldOut,
            description,
        } = req.body;

        // Validate required fields
        if (!productName || !id || !categoryId || !image || image.length === 0 || !customerPrice) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check for duplicate ID (optional)
        const existing = await Product.findOne({ id });
        if (existing) {
            return res.status(400).json({ error: 'Product ID already exists' });
        }

        const newProduct = new Product({
            productName,
            id,
            categoryId,
            image, // array of Firebase image URLs
            customerPrice,
            salePrice,
            isOnSale,
            isSoldOut,
            description,
        });

        await newProduct.save();

        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get All Products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("categoryId", "name");
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Single Product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("categoryId");
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Product
export const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const {
            productName,
            categoryId,
            id,
            images, // array of image URLs
            customerPrice,
            salePrice,
            isOnSale,
            isSoldOut,
            description,
        } = req.body;

        // Validate required fields
        if (!productName || !categoryId || !images || images.length === 0 || !customerPrice) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        console.log("The images is :" , images)
        // Find and update product
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId },
            {
                id,
                productName,
                categoryId,
                image: images,
                customerPrice,
                salePrice,
                isOnSale,
                isSoldOut,
                description,
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(updatedProduct);
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};// Delete Product



export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // Find product by custom `id` and delete it
        const deletedProduct = await Product.findOneAndDelete({ id: productId });

        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};