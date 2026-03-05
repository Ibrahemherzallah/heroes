
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
  const [searchName, setSearchName] = useState("");
  // Read query string
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get('category');
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isWholesaler = user?.role === "wholesaler";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(
            categoryId
                ? `${import.meta.env.VITE_ENV}/api/product?category=${categoryId}`
                : `${import.meta.env.VITE_ENV}/api/product`
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

    const filtered = products.filter((product) => {

      // ===== price logic =====
      const productPrice = isWholesaler
          ? product.wholesalerPrice
          : product.salePrice > 0
              ? product.salePrice
              : null;

      const price = productPrice ?? product.customerPrice;

      // ===== price filter =====
      if (minPrice !== undefined && price < minPrice) return false;
      if (maxPrice !== undefined && price > maxPrice) return false;

      // ===== name filter =====
      if (searchName && !product.productName.toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }

      return true;
    });

    setFilteredProducts(filtered);

  }, [minPrice, maxPrice, searchName, products]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
            {categoryId ? products[0]?.categoryId?.name : 'جميع المنتجات'}
          </h1>
          <div className="flex">
            <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="border rounded-lg px-4 py-2 w-full max-w-md"
            />
          </div>
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
