import { Product } from '@/contexts/CartContext';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  setMaxPrice: any;
  maxPrice: any;
  setMinPrice: any;
  minPrice: any;
  title?: string;
  showFilter: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, title, maxPrice, minPrice, setMinPrice, setMaxPrice, showFilter }) => {
  return (
    <div className="py-8">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {showFilter && (
                <div className="mb-10 flex justify-center">
                    <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border p-3">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                            فلترة حسب السعر
                        </h3>

                        <div className="flex items-center gap-3 flex-col ">
                            <div className="relative w-full">
                          <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">
                            ₪
                          </span>
                                <input
                                    type="number"
                                    placeholder="أقل سعر"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(Number(e.target.value) || '')}
                                    className="w-full border rounded-xl px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </div>

                            <div className="relative w-full">
                              <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">
                                ₪
                              </span>
                                <input
                                    type="number"
                                    placeholder="أعلى سعر"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value) || '')}
                                    className="w-full border rounded-xl px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
      
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">لا توجد منتجات متاحة حالياً</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
