
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple authentication check (in production, this would be handled by a backend)
    setTimeout(() => {
      if (email === 'admin@heroes.com' && password === 'admin123') {
        localStorage.setItem('adminLoggedIn', 'true');
        toast({
          title: "تم تسجيل الدخول",
          description: "مرحباً بك في لوحة الإدارة",
        });
        navigate('/admin/dashboard');
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1500);
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
          
          <div className="mt-6 p-4 bg-heroes-blue-light rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              <strong>معلومات تسجيل الدخول التجريبية:</strong>
            </p>
            <p className="text-sm">البريد: admin@heroes.com</p>
            <p className="text-sm">كلمة المرور: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
