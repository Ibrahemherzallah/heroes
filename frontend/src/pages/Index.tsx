import {useState, useEffect, useRef} from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import { Product } from '@/contexts/CartContext';
import { FaFacebook, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { FaHeadphones } from "react-icons/fa";
import {getCategoryDescription, getCategoryIcon} from "@/utils/categoryIcons.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const scrollAmount = 455;
  const scrollRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("token");


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

  const scrollLeft = () => {
      scrollRef.current?.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    };

  const scrollRight = () => {
      scrollRef.current?.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
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
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4 relative">

          <h2 className="text-3xl font-bold mb-8 text-center">
            فئات المنتجات
          </h2>

          {/* Left Button */}
          <button onClick={scrollLeft} className="absolute left-0 top-[60%] -translate-y-1/2 bg-white shadow-md p-3 rounded-full z-10 hover:bg-gray-100">
            <ChevronLeft size={22} />
          </button>

          {/* Right Button */}
          <button onClick={scrollRight} className="absolute right-0 top-[60%] -translate-y-1/2 bg-white shadow-md p-3 rounded-full z-10 hover:bg-gray-100">
            <ChevronRight size={22} />
          </button>

          {/* Scroll Container */}
          <div ref={scrollRef} className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar">
            {categories.map((category: any) => {
              const Icon = getCategoryIcon(category.name);
              const description = category.description || getCategoryDescription(category.name);

              return (
                  <Link key={category._id} to={`/products?category=${category._id}`}>
                    <div
                        className="flex-shrink-0 h-56 bg-[#ebf9eb] rounded-2xl
                        flex flex-col items-center justify-center
                        cursor-pointer transition-all duration-300 ease-in-out
                        hover:bg-[#ebf4eb] hover:shadow-[0_10px_20px_rgba(0,0,0,0.08)]
                        hover:-translate-y-1"
                        style={{width:'27rem'}}
                    >
                      {/* Icon */}
                      <div className="w-16 h-16 bg-heroes-blue rounded-full flex items-center justify-center text-white mb-4">
                        <Icon size={24} />
                      </div>

                      {/* Title */}
                      <p className="text-lg font-semibold text-center px-4 mb-2">
                        {category.name}
                      </p>

                      {/* Description */}
                      <p className="text-sm text-gray-600 text-center px-6 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </Link>
              );
            })}
          </div>
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
