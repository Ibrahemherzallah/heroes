import express from "express";
import {createOrder, getAllOrders, getOrderById, updateOrder, deleteOrder, sendWhatsAppMessage, sendContactUsMessage, getMyOrders, updateOrderStatus, getRecentOrderFinance} from "../controllers/order.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import {optionalAuth} from "../middleware/optionalAuth.js";

const router = express.Router();

router.post("/", optionalAuth, createOrder);
router.get("/", getAllOrders);

// ✅ Put specific routes BEFORE dynamic routes
router.get("/my-orders", authenticate, getMyOrders);

router.post("/send-whatsapp", sendWhatsAppMessage);
router.post("/send-contact-us", sendContactUsMessage);
router.get("/recent-orders", getRecentOrderFinance);
// ❗ Keep this LAST
router.get("/:id", getOrderById);
router.put("/:id", updateOrder);
router.patch("/:id/status", authenticate, updateOrderStatus);
router.delete("/:id", authenticate, deleteOrder);

export default router;