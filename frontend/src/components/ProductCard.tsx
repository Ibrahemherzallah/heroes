
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product, useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  console.log("The product is : ",  product)
  const handleAddToCart = () => {
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

  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.customerPrice;
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 animate-fade-in">
      <CardContent className="p-4">
        <Link to={`/product/${product._id}`}>
          <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-gray-100 cursor-pointer">
            <img
              src={product.image}
              alt={product.productName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {product.isOnSale && (
              <Badge className="absolute top-2 left-2 bg-heroes-red">
                تخفيض
              </Badge>
            )}
            
            {product.isSoldOut && (
              <Badge className="absolute top-2 right-2 bg-gray-500">
                نفدت الكمية
              </Badge>
            )}
          </div>
        </Link>

        <Link to={`/product/${product.id}`}>
          <h3
              className="font-semibold text-lg mb-2 hover:text-heroes-red transition-colors cursor-pointer truncate"
              title={product.productName} // shows full text on hover
          >
            {product.productName}
          </h3>
        </Link>

        <p
            className="text-gray-600 text-sm mb-3 truncate min-h-[20px]"
            title={product.description || ''}
        >
          {product.description || '\u00A0'}
        </p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-heroes-red">
            {displayPrice?.toFixed(2)} ₪
          </span>
          
          {product.isOnSale && product.salePrice && (
            <span className="text-sm text-gray-500 line-through">
              {product?.customerPrice?.toFixed(2)} ₪
            </span>
          )}
        </div>
      </CardContent>

      {
          product?.categoryId?.name !== "إشتراكات" && (
              <CardFooter className="p-4 pt-0">
                <Button onClick={handleAddToCart} className={`w-full ${product.isSoldOut
                    ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed'
                    : 'bg-heroes-red hover:bg-heroes-red/90'
                }`}
                        disabled={product.isSoldOut}
                >
                  {product.isSoldOut ? 'نفدت الكمية' : '  إضافة للسلة'}
                </Button>
              </CardFooter>
          )
      }
    </Card>
  );
};

export default ProductCard;
