// routes/categoryRoutes.js
import express from "express";
import {createCategory, getCategories, getCategoryById, updateCategory, deleteCategory} from "../controllers/category.controller.js";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorizeAdmin} from "../middleware/authorizeAdmin.js";

const router = express.Router();

router.post("/",authenticate, authorizeAdmin, createCategory);
router.get('/', getCategories);
router.get("/:id", getCategoryById);
router.put("/:id",authenticate, authorizeAdmin, updateCategory);
router.delete("/:id",authenticate, authorizeAdmin, deleteCategory);

export default router;
