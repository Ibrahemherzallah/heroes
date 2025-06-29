
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, User, Mail, Lock } from 'lucide-react';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    username: 'مدير النظام',
    email: 'admin@heroes.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.username || !profileData.email) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically send the data to your backend
    toast({
      title: "تم التحديث",
      description: "تم تحديث بيانات الملف الشخصي بنجاح",
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.currentPassword || !profileData.newPassword || !profileData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع حقول كلمة المرور",
        variant: "destructive"
      });
      return;
    }

    if (profileData.newPassword !== profileData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الجديدة وتأكيدها غير متطابقتين",
        variant: "destructive"
      });
      return;
    }

    if (profileData.newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically send the data to your backend
    toast({
      title: "تم التحديث",
      description: "تم تغيير كلمة المرور بنجاح",
    });
    
    // Clear password fields
    setProfileData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                العودة للوحة الإدارة
              </Button>
              <h1 className="text-2xl font-bold text-heroes-red">
                الملف الشخصي
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم المستخدم</label>
                  <Input
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="اسم المستخدم"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="البريد الإلكتروني"
                    required
                  />
                </div>

                <Button type="submit" className="bg-heroes-red hover:bg-heroes-red/90">
                  تحديث المعلومات
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                تغيير كلمة المرور
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">كلمة المرور الحالية</label>
                  <Input
                    type="password"
                    value={profileData.currentPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="كلمة المرور الحالية"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">كلمة المرور الجديدة</label>
                  <Input
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="كلمة المرور الجديدة"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور الجديدة</label>
                  <Input
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="تأكيد كلمة المرور الجديدة"
                  />
                </div>

                <Button type="submit" className="bg-heroes-red hover:bg-heroes-red/90">
                  تغيير كلمة المرور
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                معلومات الحساب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">نوع الحساب:</span>
                  <span className="font-medium">مدير النظام</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ إنشاء الحساب:</span>
                  <span className="font-medium">١ يناير ٢٠٢٤</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">آخر تسجيل دخول:</span>
                  <span className="font-medium">اليوم</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminProfile;
