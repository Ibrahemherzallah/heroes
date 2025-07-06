
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {ArrowLeft, Globe, ShoppingCart} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Product, useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';
import Header from "@/components/Header.tsx";

// Sample products data - in a real app, this would come from an API

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [error, setError] = useState();
  const [loading,setLoading] = useState(false)
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:4040/api/product/${id}`);
        if (!res.ok) throw new Error('فشل تحميل المنتجات');

        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct()
  }, [id]);
  useEffect(() => {
    const fetchRelatedProducts = async (categoryId: string, excludeId: string) => {
      try {
        const res = await fetch(`http://localhost:4040/api/product/related/${categoryId}?excludeId=${excludeId}`);
        if (!res.ok) throw new Error("فشل في جلب المنتجات ذات الصلة");

        const data = await res.json();
        setRelatedProducts(data);
      } catch (err: any) {
        console.error("Error loading related products:", err.message);
      }
    };
    if (product && product.categoryId?._id) {
      fetchRelatedProducts(product.categoryId._id, product._id);
    }
  }, [product]);
  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.isSoldOut) {
      toast({
        title: "المنتج غير متوفر",
        description: "هذا المنتج غير متوفر حالياً",
        variant: "destructive"
      });
      return;
    }
    
    addToCart(product);
    toast({
      title: "تم إضافة المنتج",
      description: `تم إضافة ${product.productName} إلى السلة`,
    });
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">المنتج غير موجود</h1>
          <Link to="/products">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              العودة للمنتجات
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.customerPrice;
  const productImages = product.image && product.image.length > 0 ? product.image : [product.image];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/products" className="text-heroes-red hover:underline">
            المنتجات
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-900">{product.productName}</span>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="h-[500px] bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={productImages[selectedImageIndex]}
                alt={product.productName}
                className="w-full h-full object-cover"
              />
            </div>
            
            {productImages.length > 1 && (
              <div className="flex space-x-2 space-x-reverse">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImageIndex 
                        ? 'border-heroes-red' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.productName} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.productName}
              </h1>
              
              <div className="flex items-center gap-2 mb-4">
                {product.isOnSale && (
                  <Badge className="bg-heroes-red">
                    تخفيض
                  </Badge>
                )}
                
                {product.isSoldOut && (
                  <Badge className="bg-gray-500">
                    نفدت الكمية
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-heroes-red">
                  {displayPrice.toFixed(2)}₪
                </span>
                
                {product.isOnSale && product.salePrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {product.customerPrice.toFixed(2)}₪
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {product.description}
              </p>
            </div>
            {
                product?.properties.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">خصائص المنتج:</h3>
                      <ul className="space-y-2 text-gray-600">
                        {
                          product.properties.map((prop, index) => (
                              <li key={index}>• {prop} </li>
                          ))
                        }
                      </ul>
                    </div>

                )
            }
            {
              product?.url && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">الرابط :</h3>
                  <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:underline text-sm break-all"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {product.url}
                  </a>
                </div>
            )}
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-heroes-red hover:bg-heroes-red/90 text-lg py-6"
              disabled={product.isSoldOut}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.isSoldOut ? 'نفدت الكمية' : 'إضافة للسلة'}
            </Button>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              منتجات ذات صلة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

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

export default ProductDetails;
