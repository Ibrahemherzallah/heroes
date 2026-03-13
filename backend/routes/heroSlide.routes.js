import express from "express";
import {createHeroSlide, getHeroSlides, getAllHeroSlides, updateHeroSlide, deleteHeroSlide,} from "../controllers/heroSlide.controller.js";
// import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getHeroSlides);
router.get("/admin", getAllHeroSlides);
router.post("/", createHeroSlide);
router.put("/:id", updateHeroSlide);
router.delete("/:id", deleteHeroSlide);

export default router;