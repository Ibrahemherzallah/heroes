import {useState, useEffect, useRef} from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import SpecialOffersGrid from "@/components/SpecialOffersGrid";
import { Product } from '@/contexts/CartContext';
import { FaFacebook, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import HeroCarousel from "@/components/HeroCarousel.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import HeroSlideForm from '@/components/HeroSlideForm';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [specialOffers, setSpecialOffers] = useState<Product[]>([]);
  const token = localStorage.getItem("token");
  const [showAll, setShowAll] = useState(false);

  const visibleCategories = showAll
      ? categories
      : categories.slice(0, 14);

  const [showHeroSlideForm, setShowHeroSlideForm] = useState(false);
  const [editingHeroSlide, setEditingHeroSlide] = useState<any | null>(null);

  const handleSaveHeroSlide = async (slideData: any) => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const isEdit = !!slideData.id;

      const res = await fetch(
          isEdit
              ? `${import.meta.env.VITE_ENV}/api/hero-slides/${slideData.id}`
              : `${import.meta.env.VITE_ENV}/api/hero-slides`,
          {
            method: isEdit ? "PUT" : "POST",
            headers,
            body: JSON.stringify({
              title: slideData.title,
              subtitle: slideData.subtitle,
              image: slideData.image,
              mobileImage: slideData.mobileImage,
              order: slideData.order,
              isActive: slideData.isActive,
            }),
          }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل حفظ السلايد");
      }

      toast({
        title: "تم بنجاح",
        description: isEdit ? "تم تعديل السلايد" : "تمت إضافة السلايد",
      });

      setShowHeroSlideForm(false);
      setEditingHeroSlide(null);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحفظ",
        variant: "destructive",
      });
    }
  };



  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_ENV}/api/product/featured`);
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
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_ENV}/api/category`);

        if (!res.ok) throw new Error("فشل تحميل الفئات");

        const data = await res.json();
        setCategories(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    const fetchSpecialOffers = async () => {
      try {
        const res = await fetch(
            `${import.meta.env.VITE_ENV}/api/product/special-offers`
        );

        if (!res.ok) {
          throw new Error("فشل تحميل العروض الخاصة");
        }

        const data = await res.json();

        setSpecialOffers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSpecialOffers()
    fetchCategories();
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <HeroCarousel
          isAdmin={user?.role === "admin"}
          onEditSlide={(slide) => {
            setEditingHeroSlide(slide);
            setShowHeroSlideForm(true);
          }}
          onAddSlide={() => {
            setEditingHeroSlide(null);
            setShowHeroSlideForm(true);
          }}
      />

      {/* Categories Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">

          <h2 className="text-3xl font-bold mb-10 text-center">
            فئات المنتجات
          </h2>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-5">
            {visibleCategories.map((category: any) => (
                <Link key={category._id} to={`/products?category=${category._id}`} className="flex flex-col items-center text-center group">
                  {/* Image */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200 group-hover:scale-105 transition-transform duration-300">
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover"/>
                  </div>

                  {/* Name */}
                  <p className="mt-3 text-sm font-medium text-gray-700 leading-tight">
                    {category.name}
                  </p>
                </Link>
            ))}
          </div>


          {/* Show More Button */}
          {categories.length > 10 && (
              <div className="flex justify-center mt-10">
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition"
                >
                  {showAll ? "عرض أقل" : "عرض المزيد"}
                </button>
              </div>
          )}
        </div>
      </section>

      {specialOffers.length > 0 && (
          <SpecialOffersGrid products={specialOffers} />
      )}

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {loading ? (
              <p className="text-center text-lg font-semibold text-gray-500">جاري تحميل المنتجات...</p>
          ) : error ? (
              <p className="text-center text-red-500 font-semibold">{error}</p>
          ) : (
              <ProductGrid products={products} title="المنتجات المميزة" showFilter={false} />
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
                <li><a href="/policy" className="hover:text-white">سياسة التوصيل</a></li>

              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">فئات المنتجات</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/products?category=68643f49332437732c8103aa" className="hover:text-white">كاميرات المراقبة</Link></li>
                <li><Link to="/products?category=68643f38332437732c8103a8" className="hover:text-white">رسيفرات انترنت</Link></li>
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
      <Dialog open={showHeroSlideForm || !!editingHeroSlide}
          onOpenChange={() => {
            setShowHeroSlideForm(false);
            setEditingHeroSlide(null);
          }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ textAlign: "start" }}>
              {editingHeroSlide ? "تعديل سلايد الهيرو" : "إضافة سلايد جديدة"}
            </DialogTitle>
          </DialogHeader>

          <HeroSlideForm
              slide={editingHeroSlide || undefined}
              onSave={handleSaveHeroSlide}
              onCancel={() => {
                setShowHeroSlideForm(false);
                setEditingHeroSlide(null);
              }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
