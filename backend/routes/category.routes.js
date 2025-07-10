// routes/categoryRoutes.js
import express from "express";
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from "../controllers/category.controller.js";
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",authenticate, createCategory);
router.get('/', getCategories);
router.get("/:id", getCategoryById);
router.put("/:id",authenticate, updateCategory);
router.delete("/:id",authenticate, deleteCategory);

export default router;
