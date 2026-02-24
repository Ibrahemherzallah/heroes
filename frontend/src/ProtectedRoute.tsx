// src/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    // not logged in at all
    if (!token || !rawUser) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(rawUser);

        // logged in but NOT admin
        if (!user.isAdmin) {
            return <Navigate to="/profile" replace />;
        }

        // admin → allow
        return <>{children}</>;
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;