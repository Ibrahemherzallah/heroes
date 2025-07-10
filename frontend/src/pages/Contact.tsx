import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import {useState} from "react";
import { toast } from '@/hooks/use-toast';

const Contact = () => {

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSending, setIsSending] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const { name, phone, email, subject, message } = formData;

    if (!name || !phone || !email || !subject || !message) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('https://heroess.top/api/order/send-contact-us', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: name,
          phoneNumber: phone,
          subject,
          email,
          notes: message,
          source: 'رسالة من صفحة اتصل بنا',
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'فشل في إرسال الرسالة');

      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال رسالتك بنجاح عبر واتساب',
      });

      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      toast({
        title: 'خطأ',
        description: err.message || 'حدث خطأ أثناء الإرسال',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
            اتصل بنا
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">أرسل لنا رسالة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الاسم</label>
                    <Input
                        placeholder="اسمك الكامل"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                    <Input
                        placeholder="رقم الهاتف"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                  <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الموضوع</label>
                  <Input
                      placeholder="موضوع الرسالة"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الرسالة</label>
                  <Textarea
                      placeholder="اكتب رسالتك هنا..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                  />
                </div>

                <Button
                    className="w-full bg-heroes-red hover:bg-heroes-red/90"
                    onClick={handleSubmit}
                    disabled={isSending}
                >
                  {isSending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </Button>
              </CardContent>
            </Card>
            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="bg-heroes-red/10 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-heroes-red" />
                    </div>
                    <div>
                      <h3 className="font-semibold">رقم الهاتف</h3>
                      <p className="text-gray-600">972-59-257-2788+</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="bg-heroes-red/10 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-heroes-red" />
                    </div>
                    <div>
                      <h3 className="font-semibold">البريد الإلكتروني</h3>
                      <p className="text-gray-600">heroestechnologecompany@gmail.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="bg-heroes-red/10 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-heroes-red" />
                    </div>
                    <div>
                      <h3 className="font-semibold">العنوان</h3>
                      <p className="text-gray-600">جنين، شارع حيفا</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="bg-heroes-red/10 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-heroes-red" />
                    </div>
                    <div>
                      <h3 className="font-semibold">ساعات العمل</h3>
                      <p className="text-gray-600">السبت - الخميس: 9:00 ص - 10:00 م</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
