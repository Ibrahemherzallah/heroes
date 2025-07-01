import express from 'express';
import {changePassword, getProfile, login, signup, updateProfile} from '../controllers/auth.controller.js';
import {authenticate} from "../middleware/authMiddleware.js";

const router = express.Router();
router.post('/login', login);
router.post('/signup', signup);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
export default router;
