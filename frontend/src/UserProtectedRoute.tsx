// src/UserProtectedRoute.tsx
import { Navigate } from "react-router-dom";

const UserProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    if (!token || !rawUser) {
        return <Navigate to="/login" replace />;
    }

    // if you want, you can parse & validate more here
    try {
        JSON.parse(rawUser);
    } catch {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default UserProtectedRoute;