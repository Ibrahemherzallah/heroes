import express from 'express';
import {changePassword, login, signup, updateUser} from '../controllers/auth.controller.js';
import {authenticate} from "../middleware/authMiddleware.js";
import {createProduct, deleteProduct, getAllProducts, getProductById, updateProduct} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;