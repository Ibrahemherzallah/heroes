import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import {useEffect, useState} from "react";
import {Product} from "@/contexts/CartContext.tsx";

const Categories = () => {

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://heroess.top/api/category');
        if (!res.ok) throw new Error('فشل تحميل المنتجات');

        const data = await res.json();
        setCategories(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  console.log("categories is : ", categories)
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
            فئات المنتجات
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link key={category._id} to={`/products?category=${category._id}`}>
                <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <h3 className="text-xl font-semibold mb-2 text-gray-900">
                      {category.name}
                    </h3>

                    <p className="text-gray-600 mb-4">
                      {category.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-heroes-red font-medium">
                        {category.itemCount} منتج
                      </span>
                      <span className="text-sm text-gray-500">
                        عرض الكل ←
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Categories;
