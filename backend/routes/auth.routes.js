import express from 'express';
import {changePassword, createWholesaler, deleteUser, getAllUsers, getProfile, login, signup, updateProfile, updateWholesaler} from '../controllers/auth.controller.js';
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();
router.post('/login', login);
router.post('/signup', signup);
router.get('/profile', authenticate, getProfile);
router.get("/users", authenticate, getAllUsers);
router.post("/users", authenticate, createWholesaler);
router.put("/users/:id",authenticate, updateWholesaler);
router.put('/me', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.delete("/users/:id", authenticate, deleteUser);
export default router;
