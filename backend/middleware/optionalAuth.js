import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(); // 👈 Guest → continue normally
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");

        if (user) {
            req.user = user; // 👈 Logged in user
        }

        next();
    } catch (err) {
        // 👈 Don't block order if token invalid
        console.warn("Optional auth failed:", err.message);
        next();
    }
};