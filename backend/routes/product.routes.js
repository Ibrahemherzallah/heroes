import express from 'express';
import {
    createProduct,
    deleteProduct,
    getFeaturedProducts,
    getProductById, getProducts, getRelatedProducts, reorderProduct,
    updateProduct
} from "../controllers/product.controller.js";
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",authenticate, createProduct);
router.post("/reorder",reorderProduct)
router.get("/", getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/related/:categoryId', getRelatedProducts);
router.get("/:id", getProductById);
router.put("/:id",authenticate, updateProduct);
router.delete("/:id",authenticate, deleteProduct);

export default router;