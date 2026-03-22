import express from 'express';
import {createProduct, deleteProduct, getFeaturedProducts, getProductById, getProducts, getRelatedProducts, reorderProduct, toggleFeatured, updateProduct} from "../controllers/product.controller.js";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorizeAdmin} from "../middleware/authorizeAdmin.js";

const router = express.Router();

router.post("/",authenticate, authorizeAdmin, createProduct);
router.post("/reorder",reorderProduct)
router.get("/", getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/related/:categoryId', getRelatedProducts);
router.get("/:id", getProductById);
router.put("/:id",authenticate, authorizeAdmin, updateProduct);
router.patch("/:id/toggle-featured",authenticate, authorizeAdmin, toggleFeatured);
router.delete("/:id", authenticate, authorizeAdmin, deleteProduct);

export default router;