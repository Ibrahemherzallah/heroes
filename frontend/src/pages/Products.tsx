
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import { Product } from '@/contexts/CartContext';

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  
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

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  useEffect(() => {
    if (categoryFilter) {
      setFilteredProducts(products.filter(product => product.category === categoryFilter));
    } else {
      setFilteredProducts(products);
    }
  }, [categoryFilter, products]);

  const getCategoryName = (categoryId: string) => {
    const categoryNames: { [key: string]: string } = {
      'receiver': 'أجهزة الاستقبال',
      'cameras': 'كاميرات المراقبة',
      'mobile-accessories': 'إكسسوارات الجوال',
      'computer-accessories': 'إكسسوارات الكمبيوتر',
      'internet-subscription': 'اشتراكات الإنترنت',
      'electronic-items': 'الأجهزة الإلكترونية'
    };
    return categoryNames[categoryId] || 'المنتجات';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
            {categoryFilter ? getCategoryName(categoryFilter) : 'جميع المنتجات'}
          </h1>
          <ProductGrid products={filteredProducts} />
        </div>
      </section>
    </div>
  );
};

export default Products;
