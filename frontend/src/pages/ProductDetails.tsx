
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Product, useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';

// Sample products data - in a real app, this would come from an API
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'رسيفر HD عالي الدقة',
    price: 299,
    salePrice: 249,
    isOnSale: true,
    description: 'رسيفر عالي الجودة يدعم القنوات المشفرة وغير المشفرة مع تقنية HD عالية الوضوح',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=600&fit=crop'
    ],
    category: 'receiver',
    isSoldOut: false
  },
  {
    id: '2',
    name: 'كاميرا مراقبة ذكية 4K',
    price: 799,
    description: 'كاميرا مراقبة بدقة 4K مع الرؤية الليلية والاتصال اللاسلكي وتقنيات الذكاء الاصطناعي',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop'
    ],
    category: 'cameras',
    isSoldOut: false
  },
  {
    id: '3',
    name: 'شاحن لاسلكي للجوال',
    price: 149,
    description: 'شاحن لاسلكي سريع متوافق مع جميع الهواتف الذكية الحديثة',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=400&fit=crop',
    category: 'mobile-accessories',
    isSoldOut: true
  },
  {
    id: '4',
    name: 'ماوس كمبيوتر لاسلكي',
    price: 199,
    description: 'ماوس كمبيوتر لاسلكي عالي الدقة ومريح للاستخدام مع بطارية تدوم طويلاً',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop',
    category: 'computer-accessories',
    isSoldOut: false
  },
  {
    id: '5',
    name: 'باقة إنترنت عالي السرعة',
    price: 199,
    description: 'اشتراك شهري للإنترنت عالي السرعة بلا حدود مع دعم فني على مدار الساعة',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=400&fit=crop',
    category: 'internet-subscription',
    isSoldOut: false
  },
  {
    id: '6',
    name: 'نظام أمان ذكي',
    price: 1299,
    salePrice: 999,
    isOnSale: true,
    description: 'نظام أمان ذكي متكامل مع أجهزة استشعار وكاميرات وتطبيق جوال للمراقبة',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop',
    category: 'electronic-items',
    isSoldOut: false
  }
];

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    // Find the product by ID
    const foundProduct = sampleProducts.find(p => p.id === id);
    setProduct(foundProduct || null);

    // Get related products from the same category
    if (foundProduct) {
      const related = sampleProducts
        .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
        .slice(0, 4);
      setRelatedProducts(related);
    }
  }, [id]);

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
      description: `تم إضافة ${product.name} إلى السلة`,
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

  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/products" className="text-heroes-red hover:underline">
            المنتجات
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={productImages[selectedImageIndex]}
                alt={product.name}
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
                      alt={`${product.name} ${index + 1}`}
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
                {product.name}
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
                  {displayPrice.toFixed(2)} ر.س
                </span>
                
                {product.isOnSale && product.salePrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {product.price.toFixed(2)} ر.س
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {product.description}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">خصائص المنتج:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• جودة عالية ومواد متينة</li>
                <li>• ضمان لمدة سنة واحدة</li>
                <li>• شحن مجاني داخل المملكة</li>
                <li>• دعم فني متخصص</li>
              </ul>
            </div>

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
    </div>
  );
};

export default ProductDetails;
