// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { User as UserIcon } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // لو فيه جلسة سابقة
  useEffect(() => {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    if (token && rawUser) {
      try {
        const user = JSON.parse(rawUser);
        if (user.isAdmin) navigate("/admin/dashboard");
        else navigate("/");
      } catch {
        // ignore parse error
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("email is : ", email,'d')
      console.log("password is : ", password,'d')
      const response = await fetch(`${import.meta.env.VITE_ENV}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail:email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطأ في تسجيل الدخول");
      }

      // احفظ التوكن واليوزر
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "تم تسجيل الدخول",
        description: `مرحباً بك ${data.user.userName}`,
      });
      if (data.user.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
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
              <UserIcon className="w-6 h-6 text-heroes-red" />
            </div>
            <CardTitle className="text-2xl font-bold text-heroes-red mb-2">
              تسجيل الدخول
            </CardTitle>
            <p className="text-gray-600">
              قم بتسجيل الدخول لحسابك أو{" "}
              <Link to="/signup" className="text-heroes-red underline">
                أنشئ حساب جديد
              </Link>
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  البريد الإلكتروني
                </label>
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
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

              <Button
                  type="submit"
                  className="w-full bg-heroes-red hover:bg-heroes-red/90"
                  disabled={isLoading}
              >
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
  );
};

export default Login;