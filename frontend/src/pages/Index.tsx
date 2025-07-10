import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import { Product } from '@/contexts/CartContext';
import { FaFacebook, FaTiktok, FaWhatsapp } from 'react-icons/fa';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://heroess.top/api/product/featured');
        if (!res.ok) throw new Error('فشل تحميل المنتجات');

        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
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
            <Link to="/products?category=686922259ee88f36ff9c18d0">
              <div className="text-center p-8 rounded-xl bg-heroes-blue-light hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-16 h-16 bg-heroes-blue rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">📡</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">إشتراكات</h3>
                <p className="text-gray-600">أفضل العروض والاشتراكات الرقمية للبرامج الشهيرة</p>
              </div>
            </Link>
            
            <Link to="/products?category=686507b15aec7492cb382eb2">
              <div className="text-center p-8 rounded-xl bg-heroes-blue-light hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-16 h-16 bg-heroes-blue rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">📷</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">كاميرات المراقبة</h3>
                <p className="text-gray-600">كاميرات مراقبة ذكية بأحدث التقنيات</p>
              </div>
            </Link>
            
            <Link to="/products?category=68643f49332437732c8103aa">
              <div className="text-center p-8 rounded-xl bg-heroes-blue-light hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-16 h-16 bg-heroes-blue rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">💻</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">الإكسسوارات</h3>
                <p className="text-gray-600">إكسسوارات الجوال والكمبيوتر</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link
              to="/categories"
              className="text-gray-700 hover:text-heroes-red transition-colors text-lg"
          >
            عرض الكل ←
          </Link>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {loading ? (
              <p className="text-center text-lg font-semibold text-gray-500">جاري تحميل المنتجات...</p>
          ) : error ? (
              <p className="text-center text-red-500 font-semibold">{error}</p>
          ) : (
              <ProductGrid products={products} title="المنتجات المميزة" />
          )}
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
                <li><Link to="/products?category=68643f49332437732c8103aa" className="hover:text-white">كاميرات المراقبة</Link></li>
                <li><Link to="/products?category=68643f49332437732c8103aa" className="hover:text-white">إكسسوارات الكمبيوتر</Link></li>
                <li><Link to="/products?category=686922259ee88f36ff9c18d0" className="hover:text-white">اشتراكات الإنترنت</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">تواصل معنا</h4>
              <div className="space-y-2 text-gray-400">
                <p>📞 972-59-257-2788+</p>
                <p>✉️ heroestechnologecompany@gmail.com</p>
                <p>📍 جنين، شارع حيفا</p>
              </div>
              <div className="flex gap-4 mt-4">
                <a
                    href="https://api.whatsapp.com/message/BL3LV2SY7XJGN1?autoload=1&app_absent=0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-green-400 transition"
                >
                  <FaWhatsapp size={20} />
                </a>
                <a
                    href="https://www.tiktok.com/@heroes_technology8?_t=ZS-8xZieOQIXlH&_r=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-500 transition"
                >
                  <FaTiktok size={20} />
                </a>
                <a
                    href="https://www.facebook.com/profile.php?id=61564057239223&mibextid=wwXIfr&rdid=pTY19CK9ukx6jVGS&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F19KXnysAGK%2F%3Fmibextid%3DwwXIfr#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-500 transition"
                >
                  <FaFacebook size={20} />
                </a>
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
