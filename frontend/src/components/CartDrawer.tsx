import { useState } from 'react';
import { X, Minus, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import CheckoutModal from "@/components/ui/checkoutModal.tsx";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const handleCheckout = async () => {

    if (cartItems.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "يرجى إضافة منتجات قبل إتمام الطلب",
        variant: "destructive"
      });
      return;
    }

    setIsCheckingOut(true);

    setTimeout(() => {
      toast({
        title: "تم إرسال الطلب",
        description: "سيتم التواصل معك قريباً لتأكيد الطلب",
      });
      clearCart();
      setIsCheckingOut(false);
      onClose();
    }, 2000);

  };

  if (!isOpen) return null;

  return (
      <>
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
        />

        <div className="fixed left-0 top-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">سلة التسوق</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">السلة فارغة</p>
                </div>
            ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const displayPrice = item.isOnSale && item.salePrice ? item.salePrice : item.customerPrice;

                    return (
                        <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <img
                              src={item.image[0]}
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded"
                          />

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate text-sm mb-1">{item.productName}</h3>
                            <p className="text-heroes-red font-semibold text-sm">
                              {displayPrice.toFixed(2)}₪
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>

                              <span className="w-8 text-center text-sm">{item.quantity}</span>

                              <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>

                              <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-red-500 hover:text-red-700 ml-auto"
                              >
                                حذف
                              </Button>
                            </div>
                          </div>
                        </div>
                    );
                  })}
                </div>
            )}
          </div>

          {cartItems.length > 0 && (
              <div className="border-t p-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>المجموع:</span>
                  <span className="text-heroes-red">{getTotalPrice().toFixed(2)}₪</span>
                </div>

                <Button
                    onClick={()=>{setIsCheckoutModalOpen(true)}}
                    className="w-full bg-heroes-red hover:bg-heroes-red/90"
                >
                  إتمام الطلب
                </Button>
              </div>
          )}
        </div>

        <CheckoutModal
            isOpen={isCheckoutModalOpen}
            onClose={() => setIsCheckoutModalOpen(false)}
        />
      </>
  );
};

export default CartDrawer;