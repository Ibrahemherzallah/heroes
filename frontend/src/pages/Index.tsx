
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import { Product } from '@/contexts/CartContext';

const Index = () => {
  // Sample products data - in a real app, this would come from an API
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'رسيفر HD عالي الدقة',
      price: 299,
      salePrice: 249,
      isOnSale: true,
      description: 'رسيفر عالي الجودة يدعم القنوات المشفرة وغير المشفرة',
      image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=400&fit=crop',
      category: 'receiver',
      isSoldOut: false
    },
    {
      id: '2',
      name: 'كاميرا مراقبة ذكية 4K',
      price: 799,
      description: 'كاميرا مراقبة بدقة 4K مع الرؤية الليلية والاتصال اللاسلكي',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop',
      category: 'cameras',
      isSoldOut: false
    },
    {
      id: '3',
      name: 'شاحن لاسلكي للجوال',
      price: 149,
      description: 'شاحن لاسلكي سريع متوافق مع جميع الهواتف الذكية',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=400&fit=crop',
      category: 'mobile-accessories',
      isSoldOut: true
    },
    {
      id: '4',
      name: 'ماوس كمبيوتر لاسلكي',
      price: 199,
      description: 'ماوس كمبيوتر لاسلكي عالي الدقة ومريح للاستخدام',
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop',
      category: 'computer-accessories',
      isSoldOut: false
    },
    {
      id: '5',
      name: 'باقة إنترنت عالي السرعة',
      price: 199,
      description: 'اشتراك شهري للإنترنت عالي السرعة بلا حدود',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=400&fit=crop',
      category: 'internet-subscription',
      isSoldOut: true
    },
    {
      id: '6',
      name: 'نظام أمان ذكي',
      price: 1299,
      salePrice: 999,
      isOnSale: true,
      description: 'نظام أمان ذكي متكامل مع أجهزة استشعار وكاميرات',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop',
      category: 'electronic-items',
      isSoldOut: false
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-heroes-gradient-start to-heroes-gradient-end py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            مرحباً بك في Heroes
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            اكتشف أحدث الأجهزة الإلكترونية وإكسسوارات التكنولوجيا بأفضل الأسعار
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <button className="bg-heroes-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-heroes-red/90 transition-colors">
                تسوق الآن
              </button>
            </Link>
            <Link to="/categories">
              <button className="bg-white text-heroes-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-white">
                استعرض الفئات
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">فئات المنتجات</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/products?category=receiver">
              <div className="text-center p-8 rounded-xl bg-heroes-blue-light hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-16 h-16 bg-heroes-blue rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">📡</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">أجهزة الاستقبال</h3>
                <p className="text-gray-600">رسيفرات عالية الجودة وأنظمة ذكية</p>
              </div>
            </Link>
            
            <Link to="/products?category=cameras">
              <div className="text-center p-8 rounded-xl bg-heroes-blue-light hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-16 h-16 bg-heroes-blue rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">📷</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">كاميرات المراقبة</h3>
                <p className="text-gray-600">كاميرات مراقبة ذكية بأحدث التقنيات</p>
              </div>
            </Link>
            
            <Link to="/products?category=mobile-accessories">
              <div className="text-center p-8 rounded-xl bg-heroes-blue-light hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-16 h-16 bg-heroes-blue rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">الإكسسوارات</h3>
                <p className="text-gray-600">إكسسوارات الجوال والكمبيوتر</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <ProductGrid products={products} title="المنتجات المميزة" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-heroes-red">Heroes</h3>
              <p className="text-gray-400">
                منصة إلكترونية متخصصة في بيع أحدث الأجهزة الإلكترونية وإكسسوارات التكنولوجيا
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white">الرئيسية</a></li>
                <li><a href="/products" className="hover:text-white">المنتجات</a></li>
                <li><a href="/categories" className="hover:text-white">الفئات</a></li>
                <li><a href="/contact" className="hover:text-white">اتصل بنا</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">فئات المنتجات</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">أجهزة الاستقبال</a></li>
                <li><a href="#" className="hover:text-white">كاميرات المراقبة</a></li>
                <li><a href="#" className="hover:text-white">إكسسوارات الجوال</a></li>
                <li><a href="#" className="hover:text-white">اشتراكات الإنترنت</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">تواصل معنا</h4>
              <div className="space-y-2 text-gray-400">
                <p>📞 +966 50 123 4567</p>
                <p>✉️ info@heroes.com</p>
                <p>📍 الرياض، المملكة العربية السعودية</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Heroes. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
