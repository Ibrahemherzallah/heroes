import express from "express";
import {createHeroSlide, getHeroSlides, getAllHeroSlides, updateHeroSlide, deleteHeroSlide,} from "../controllers/heroSlide.controller.js";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorizeAdmin} from "../middleware/authorizeAdmin.js";
// import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getHeroSlides);
router.get("/admin", getAllHeroSlides);
router.post("/", authenticate, createHeroSlide);
router.put("/:id", authenticate, updateHeroSlide);
router.delete("/:id", authenticate, deleteHeroSlide);

export default router;