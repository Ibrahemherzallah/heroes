import { useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import CheckoutModal from "@/components/ui/checkoutModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    const {cartItems, updateQuantity, removeFromCart, getTotalPrice, getFinalPrice, getDiscountAmount, selectedPointsDiscount, setSelectedPointsDiscount,} = useCart();
    const [pendingDiscount, setPendingDiscount] = useState<number | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isWholesaler = user?.role === "wholesaler";
    const isUser = user?.role === "user";

    if (!isOpen) return null;

    const confirmApplyDiscount = () => {
        setSelectedPointsDiscount(pendingDiscount);
        setIsConfirmOpen(false);
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose}/>

            {/* Drawer */}
            <div className="fixed left-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">سلة التسوق</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    {cartItems.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            السلة فارغة
                        </div>
                    )}

                    {cartItems.map((item) => {
                        const displayPrice =
                            isWholesaler
                                ? item.wholesalerPrice
                                : item.isOnSale && item.salePrice
                                    ? item.salePrice
                                    : item.customerPrice;

                        const oldPrice =
                            isWholesaler || item.isOnSale && item.salePrice ? item.customerPrice : null


                        return (
                            <div key={item.id} className="flex gap-3 p-3 border rounded-xl">
                                <img src={item.image[0]} alt={item.productName} className="w-16 h-16 rounded-lg object-cover"/>

                                <div className="flex-1">
                                    <h3 className="text-sm font-medium mb-1 truncate">
                                        {item.productName}
                                    </h3>

                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-heroes-red font-bold">
                                          {displayPrice?.toFixed(2)} ₪
                                        </span>

                                        {oldPrice && (
                                            <span className="text-xs line-through text-gray-400">
                                                {oldPrice.toFixed(2)} ₪
                                              </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">

                                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() =>
                                            updateQuantity(item.id, item.quantity - 1)}>
                                            <Minus size={14} />
                                        </Button>

                                        <span className="w-6 text-center text-sm">
                                          {item.quantity}
                                        </span>

                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-7 w-7"
                                            onClick={() =>
                                                updateQuantity(item.id, item.quantity + 1)
                                            }
                                        >
                                            <Plus size={14} />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-500 ml-auto"
                                        >
                                            حذف
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Section */}
                {cartItems.length > 0 && (
                    <div className="border-t p-4 space-y-4 bg-white">

                        {/* Points Section */}
                        {isUser && (
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>نقاطك:</span>
                                    <span className="font-bold text-amber-700">
                                        {user?.points || 0}
                                      </span>
                                </div>

                                <div className="flex gap-2">
                                    {[20, 25, 30].map((p) => (
                                        <Button
                                            key={p}
                                            size="sm"
                                            variant={
                                                selectedPointsDiscount === p
                                                    ? "default"
                                                    : "outline"
                                            }
                                            disabled={(user?.points || 0) < p}
                                            onClick={() => {
                                                setPendingDiscount(p);
                                                setIsConfirmOpen(true);
                                            }}
                                            className="flex-1"
                                        >
                                            خصم {p}%
                                        </Button>
                                    ))}
                                </div>

                                {selectedPointsDiscount && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-500 w-full"
                                        onClick={() =>
                                            setSelectedPointsDiscount(null)
                                        }
                                    >
                                        إزالة الخصم
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Totals */}
                        <div className="space-y-2 text-sm">

                            <div className="flex justify-between">
                                <span>المجموع:</span>
                                <span>{getTotalPrice().toFixed(2)} ₪</span>
                            </div>

                            {selectedPointsDiscount && (
                                <div className="flex justify-between text-green-600">
                                  <span>
                                    الخصم ({selectedPointsDiscount}%):
                                  </span>
                                                    <span>
                                    -{getDiscountAmount().toFixed(2)} ₪
                                  </span>
                                </div>
                            )}

                            <div className="flex justify-between text-lg font-bold text-heroes-red pt-2 border-t">
                                <span>الإجمالي النهائي:</span>
                                <span>{getFinalPrice().toFixed(2)} ₪</span>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <Button
                            className="w-full bg-heroes-red hover:bg-heroes-red/90"
                            onClick={() => setIsCheckoutModalOpen(true)}
                        >
                            إتمام الطلب
                        </Button>
                    </div>
                )}
            </div>
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader  style={{textAlign: 'start'}}>
                        <DialogTitle>تأكيد استخدام النقاط</DialogTitle>
                    </DialogHeader>

                    <p className="text-sm text-gray-600">
                        هل أنت متأكد أنك تريد استخدام {pendingDiscount} نقطة للحصول على خصم {pendingDiscount}%؟
                    </p>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                            إلغاء
                        </Button>
                        <Button
                            className="bg-heroes-red hover:bg-heroes-red/90"
                            onClick={confirmApplyDiscount}
                        >
                            تأكيد
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <CheckoutModal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)}/>
        </>
    );
};

export default CartDrawer;