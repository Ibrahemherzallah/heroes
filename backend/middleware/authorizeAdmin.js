export const authorizeAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.user.isAdmin !== true) {
        return res.status(403).json({ error: "Access denied" });
    }

    next();
};