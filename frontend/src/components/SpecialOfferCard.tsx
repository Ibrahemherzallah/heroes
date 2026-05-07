import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product, useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";

interface Props {
    product: Product;
}

const SpecialOfferCard: React.FC<Props> = ({ product }) => {
    const { addToCart } = useCart();

    const displayPrice =
        product.isOnSale && product.salePrice
            ? product.salePrice
            : product.customerPrice;

    const oldPrice =
        product.isOnSale && product.salePrice
            ? product.customerPrice
            : null;

    const handleAddToCart = () => {
        if (product.isSoldOut) return;

        addToCart(product);

        toast({
            title: "تم إضافة المنتج",
            description: `تم إضافة ${product.productName} إلى السلة`,
        });
    };

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fff7ed] via-white to-[#ffe4e6] border border-orange-200 shadow-md hover:shadow-xl transition-all duration-300 group">
            {/* Top Label */}
            <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-orange-500 text-white rounded-full px-3 py-1">
                    عرض خاص
                </Badge>
            </div>

            {/* Discount Corner */}
            {oldPrice && (
                <div className="absolute top-0 left-0 z-10 bg-heroes-red text-white text-xs font-bold px-4 py-2 rounded-br-2xl">
                    وفر الآن
                </div>
            )}

            <Link to={`/product/${product._id}`}>
                <div className="relative h-56 overflow-hidden">
                    <img
                        src={Array.isArray(product.image) ? product.image[0] : product.image}
                        alt={product.productName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                    <h3 className="absolute bottom-4 right-4 left-4 text-white text-lg font-bold line-clamp-2">
                        {product.productName}
                    </h3>
                </div>
            </Link>

            <div className="p-4">
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px] mb-4">
                    {product.description || "عرض خاص لفترة محدودة"}
                </p>

                <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">السعر الآن</p>

                        <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-heroes-red">
                {displayPrice?.toFixed(2)} ₪
              </span>

                            {oldPrice && (
                                <span className="text-sm text-gray-400 line-through">
                  {oldPrice.toFixed(2)} ₪
                </span>
                            )}
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleAddToCart}
                    disabled={product.isSoldOut}
                    className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                    {product.isSoldOut ? "نفدت الكمية" : "احصل على العرض"}
                </Button>
            </div>
        </div>
    );
};

export default SpecialOfferCard;