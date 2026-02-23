
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
  const [minPrice, setMinPrice] = useState<number>();
  const [maxPrice, setMaxPrice] = useState<number>();
  // Read query string
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(
            categoryId
                ? `https://heroess.top/api/product?category=${categoryId}`
                : `https://heroess.top/api/product`
        );
        if (!res.ok) throw new Error('فشل تحميل المنتجات');

        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  useEffect(() => {
      if(!minPrice && !maxPrice){
          setFilteredProducts(products);
      }
      setFilteredProducts(products.filter(product=> product.salePrice ? product.salePrice >= minPrice && product.salePrice <= maxPrice : product.customerPrice >= minPrice && product.customerPrice <= maxPrice))
  }, [minPrice,maxPrice]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
            {categoryId ? products[0]?.categoryId?.name : 'جميع المنتجات'}
          </h1>
          {loading ? (
              <p className="text-center text-lg font-semibold text-gray-500">جاري تحميل المنتجات...</p>
          ) : error ? (
              <p className="text-center text-red-500 font-semibold">{error}</p>
          ) : (
             <ProductGrid products={filteredProducts} setMaxPrice={setMaxPrice} maxPrice={maxPrice} setMinPrice={setMinPrice} minPrice={minPrice} showFilter={true}/>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
