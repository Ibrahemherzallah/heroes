// middlewares/auth.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // ⚠️ تأكد من اسم المفتاح داخل التوكن
        // إذا كنت تستخدم jwt.sign({ userId: user._id })
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // 🔥 الآن هذا هو المهم
        req.user = user;

        next();
    } catch (err) {
        console.error("Auth error:", err);
        res.status(401).json({ error: "Invalid token" });
    }
};