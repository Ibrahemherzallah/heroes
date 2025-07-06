
import { useState, useEffect } from 'react';
import {useLocation, useSearchParams} from 'react-router-dom';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import { Product } from '@/contexts/CartContext';

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // Read query string
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get('category');
  useEffect(() => {
    if (categoryFilter) {
      setFilteredProducts(products.filter(product => product.category === categoryFilter));
    } else {
      setFilteredProducts(products);
    }
  }, [categoryFilter, products]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(
            categoryId
                ? `http://localhost:4040/api/product?category=${categoryId}`
                : `http://localhost:4040/api/product`
        );
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
  }, [categoryId]);
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
          {loading ? (
              <p className="text-center text-lg font-semibold text-gray-500">جاري تحميل المنتجات...</p>
          ) : error ? (
              <p className="text-center text-red-500 font-semibold">{error}</p>
          ) : (
              <ProductGrid products={products} />
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
