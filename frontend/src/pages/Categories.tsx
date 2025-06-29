
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';

const Categories = () => {
  const categories = [
    {
      id: 'receiver',
      name: 'أجهزة الاستقبال',
      description: 'رسيفرات عالية الجودة لاستقبال القنوات المختلفة',
      image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=400&fit=crop',
      itemCount: 15
    },
    {
      id: 'cameras',
      name: 'كاميرات المراقبة',
      description: 'كاميرات مراقبة ذكية بأحدث التقنيات',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop',
      itemCount: 25
    },
    {
      id: 'mobile-accessories',
      name: 'إكسسوارات الجوال',
      description: 'شواحن، حافظات، وإكسسوارات الهواتف الذكية',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=400&fit=crop',
      itemCount: 40
    },
    {
      id: 'computer-accessories',
      name: 'إكسسوارات الكمبيوتر',
      description: 'لوحات مفاتيح، فأرات، وملحقات الكمبيوتر',
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop',
      itemCount: 30
    },
    {
      id: 'internet-subscription',
      name: 'اشتراكات الإنترنت',
      description: 'باقات إنترنت متنوعة بسرعات مختلفة',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=400&fit=crop',
      itemCount: 8
    },
    {
      id: 'electronic-items',
      name: 'الأجهزة الإلكترونية',
      description: 'أنظمة ذكية وأجهزة إلكترونية متطورة',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop',
      itemCount: 20
    }
  ];

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
              <Link key={category.id} to={`/products?category=${category.id}`}>
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
