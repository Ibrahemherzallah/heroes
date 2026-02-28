// src/pages/Signup.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

const Signup = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [dob, setDob] = useState("");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirm) {
            toast({
                title: "خطأ",
                description: "كلمتا المرور غير متطابقتين",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_ENV}/api/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phone, userName, password, dob }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "خطأ في إنشاء الحساب");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            toast({
                title: "تم إنشاء الحساب",
                description: "مرحباً بك في Heroes",
            });

            navigate("/");
        } catch (error: any) {
            toast({
                title: "خطأ في التسجيل",
                description: error.message || "حدث خطأ",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-heroes-red/10 flex items-center justify-center">
                        <UserPlus className="w-6 h-6 text-heroes-red" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-heroes-red mb-2">
                        إنشاء حساب جديد
                    </CardTitle>
                    <p className="text-gray-600">
                        لديك حساب بالفعل؟{" "}
                        <Link to="/login" className="text-heroes-red underline">
                            تسجيل الدخول
                        </Link>
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">الاسم</label>
                            <Input
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="اسم المستخدم"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                رقم الهاتف
                            </label>
                            <Input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="059xxxxxxxxx"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                تاريخ الميلاد
                            </label>
                            <Input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                كلمة المرور
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                تأكيد كلمة المرور
                            </label>
                            <Input
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-heroes-red hover:bg-heroes-red/90"
                            disabled={isLoading}
                        >
                            {isLoading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Signup;