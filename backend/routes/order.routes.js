// routes/orderRoutes.js
import express from "express";
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    sendWhatsAppMessage, sendContactUsMessage
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.post('/send-whatsapp', sendWhatsAppMessage );
router.post('/send-contact-us', sendContactUsMessage );

export default router;
