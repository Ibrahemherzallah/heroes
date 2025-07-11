import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {User} from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const isLoggedIn = localStorage.getItem('adminLoggedIn');

    if (token && isLoggedIn === 'true') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://heroess.top/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.user?.isAdmin) {
        throw new Error('أنت لا تملك صلاحية الدخول');
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminLoggedIn', 'true');

      toast({
        title: "تم تسجيل الدخول",
        description: "مرحباً بك في لوحة الإدارة",
      });
      navigate('/admin/dashboard');

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
              <CardTitle className="text-2xl font-bold text-heroes-red mb-2">
                لوحة إدارة Heroes
              </CardTitle>
              <p className="text-gray-600">قم بتسجيل الدخول للوصول للوحة الإدارة</p>
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
                      placeholder="admin@heroes.com"
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
                  {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
  );
};

export default AdminLogin;
