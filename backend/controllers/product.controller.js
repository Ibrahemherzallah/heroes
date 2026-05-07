// controllers/productController.js
import Product from "../models/product.model.js";
import mongoose from "mongoose";
// Create Product

export const createProduct = async (req, res) => {
    try {
        const {
            productName,
            id,
            categoryId,
            image,
            originalPrice,
            customerPrice,
            wholesalerPrice,
            salePrice,
            isOnSale,
            isSoldOut,
            stock,
            type,
            description,
            url,
            properties
        } = req.body;

        // Validate required fields
        if (!productName || !id || !categoryId || !image || image.length === 0 || !originalPrice || !customerPrice || !wholesalerPrice || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // If product is inStore, stock must be provided
        if (type === 'inStore' && (stock === undefined || stock < 0)) {
            return res.status(400).json({ error: 'Stock is required for in-store products' });
        }

        const existing = await Product.findOne({ id });
        if (existing) {
            return res.status(400).json({ error: 'رقم المنتج موجود بالفعل' });
        }

        const newProduct = new Product({
            productName,
            id,
            categoryId,
            image,
            originalPrice,
            customerPrice,
            wholesalerPrice,
            salePrice,
            isOnSale,
            isSoldOut: type === 'inStore' ? (stock === 0) : false,
            stock: type === 'inStore' ? stock : null,
            type,
            description,
            url,
            properties
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Get All Products
export const getProducts = async (req, res) => {
    try {
        const { category } = req.query;
        console.log('category:', category);

        const filter = category ? { categoryId: category } : {};
        console.log('filter:', filter);

        const products = await Product.find(filter)
            .populate('categoryId')
            .sort({ sortOrder: 1, createdAt: -1 });// first by manual order, then by newest
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء جلب المنتجات' });
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getSpecialOffers = async (req, res) => {
    try {
        const products = await Product.find({
            isSpecialOffer: true,
        })
            .populate("categoryId")
            .sort({ createdAt: -1 });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            error: "فشل تحميل العروض الخاصة",
        });
    }
};

export const toggleSpecialOffer = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                error: "المنتج غير موجود",
            });
        }

        product.isSpecialOffer = !product.isSpecialOffer;

        await product.save();

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            error: "فشل تحديث العرض الخاص",
        });
    }
};


export const reorderProduct = async (req, res) => {
    try {
        const updates = req.body; // [{ id, sortOrder }]
        console.log('updates:', updates);
        const bulkOps = updates.map((u) => ({
            updateOne: {
                filter: { id: u.id },
                update: { sortOrder: u.sortOrder }
            }
        }));
        await Product.bulkWrite(bulkOps);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ message: "Error updating order" });
    }
}
// GET /api/product/related/:categoryId?excludeId=productId
export const getRelatedProducts = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { excludeId } = req.query;

        if (!categoryId) {
            return res.status(400).json({ error: "Category ID is required" });
        }

        const query = {
            categoryId,
        };

        // exclude the current product
        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const relatedProducts = await Product.find(query).limit(10); // adjust limit as needed
        res.status(200).json(relatedProducts);
    } catch (err) {
        console.error("Error fetching related products:", err);
        res.status(500).json({ error: "Server error" });
    }
};

export const toggleFeatured = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        console.log("product is : ", product)
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.isFeatured = !product.isFeatured;
        await product.save();

        res.status(200).json({
            message: "Featured status updated",
            product,
        });
    } catch (error) {
        console.error("Toggle featured error:", error);
        res.status(500).json({ message: "Server error" });
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
            images,
            originalPrice,
            customerPrice,
            wholesalerPrice,
            salePrice,
            isOnSale,
            isSoldOut,
            stock,
            type,
            description,
            url,
            properties
        } = req.body;

        if (!productName || !categoryId || !images || images.length === 0 || !originalPrice || !customerPrice || !wholesalerPrice || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (type === 'inStore' && (stock === undefined || stock < 0)) {
            return res.status(400).json({ error: 'Stock is required for in-store products' });
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId },
            {
                id,
                productName,
                categoryId,
                image: images,
                originalPrice,
                customerPrice,
                wholesalerPrice,
                salePrice,
                isOnSale,
                isSoldOut: type === 'inStore' ? (stock === 0) : false,
                stock: type === 'inStore' ? stock : null,
                type,
                description,
                url,
                properties
            },
            { new: true }
        );

        if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
        res.status(200).json(updatedProduct);
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

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