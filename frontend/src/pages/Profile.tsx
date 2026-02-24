// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User as UserIcon, LogOut, Settings } from "lucide-react";

interface User {
    id: string;
    email: string;
    userName: string;
    isAdmin?: boolean;
    dob?: string;
}

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!raw || !token) {
            navigate("/login");
            return;
        }

        try {
            const parsed: User = JSON.parse(raw);
            setUser(parsed);
        } catch {
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-heroes-red/10 flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-heroes-red" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        مرحباً، {user.userName}
                    </CardTitle>
                    <p className="text-gray-500">{user.email}</p>
                    {user.dob && (
                        <p className="text-gray-500">
                            تاريخ الميلاد: {new Date(user.dob).toLocaleDateString("ar-EG")}
                        </p>
                    )}
                </CardHeader>

                <CardContent className="space-y-4">
                    {user.isAdmin && (
                        <Button
                            className="w-full flex items-center justify-center gap-2"
                            variant="outline"
                            onClick={() => navigate("/admin/dashboard")}
                        >
                            <Settings className="w-4 h-4" />
                            الذهاب إلى لوحة الإدارة
                        </Button>
                    )}

                    <Button
                        variant="destructive"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" />
                        تسجيل الخروج
                    </Button>

                    <div className="text-center text-sm text-gray-500 mt-2">
                        <Link to="/" className="text-heroes-red underline">
                            العودة للصفحة الرئيسية
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;