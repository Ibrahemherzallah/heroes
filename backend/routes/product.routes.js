import express from 'express';
import {
    createProduct,
    deleteProduct,
    getFeaturedProducts,
    getProductById, getProducts, getRelatedProducts,
    updateProduct
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/related/:categoryId', getRelatedProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;