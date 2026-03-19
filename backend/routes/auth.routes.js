import express from 'express';
import {changePassword, createWholesaler, deleteUser, getAllUsers, getProfile, login, resetUserPassword, signup, updateProfile, updateWholesaler} from '../controllers/auth.controller.js';
import {authenticate} from "../middleware/authMiddleware.js";
import {authorizeAdmin} from "../middleware/authorizeAdmin.js";

const router = express.Router();
router.post('/login', login);
router.post('/signup', signup);
router.get('/profile', authenticate, getProfile);
router.get("/users", authenticate, authorizeAdmin, getAllUsers);
router.post("/users", authenticate, authorizeAdmin, createWholesaler);
router.put("/users/:id",authenticate, authorizeAdmin, updateWholesaler);
router.put('/me', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post("/reset-password", authenticate, authorizeAdmin, resetUserPassword);
router.delete("/users/:id", authenticate, authorizeAdmin, deleteUser);
export default router;
