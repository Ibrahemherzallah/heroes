import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const deliveryRegions = [
    { name: 'الضفة الغربية', price: 20 },
    { name: 'الداخل', price: 70 },
    { name: 'القدس', price: 30 },
    { name: 'ابو غوش', price: 50 }
];

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        region: '',
        city: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { getTotalPrice, clearCart, cartItems } = useCart();

    const selectedRegion = deliveryRegions.find(region => region.name === formData.region);
    const deliveryPrice = selectedRegion ? selectedRegion.price : 0;
    const totalPrice = getTotalPrice() + deliveryPrice;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName || !formData.phoneNumber || !formData.region || !formData.city) {
            toast({
                title: "خطأ",
                description: "يرجى ملء جميع الحقول المطلوبة",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        const numOfItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        const totalPrice = getTotalPrice();

        const orderPayload = {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            region: formData.region,
            city: formData.city,
            notes: formData.notes,
            price: totalPrice,
            deliveryPrice: deliveryPrice,
            numOfItems,
            products: cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }))
        };

        try {
            // 1. Submit order to backend
            const response = await fetch(`http://localhost:4040/api/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'فشل في إرسال الطلب');
            }

            // 2. Send WhatsApp message
            await fetch(`http://localhost:4040/api/order/send-whatsapp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...orderPayload,
                    type: 'Heroes Store' // optional: indicate the source of the order
                })
            });

            toast({
                title: "تم إرسال الطلب بنجاح",
                description: "سيتم التواصل معك قريباً لتأكيد الطلب"
            });

            clearCart();
            setFormData({
                fullName: '',
                phoneNumber: '',
                region: '',
                city: '',
                notes: ''
            });
            onClose();

        } catch (error: any) {
            toast({
                title: "خطأ في الطلب",
                description: error.message || "حدث خطأ غير متوقع أثناء إرسال الطلب",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };



    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader style={{textAlign:"start", marginBottom:"10px"}}>
                    <DialogTitle>إتمام الطلب</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="fullName">الاسم الكامل *</Label>
                        <Input
                            id="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            placeholder="أدخل الاسم الكامل"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="phoneNumber">رقم الهاتف (مع المقدمة) *</Label>
                        <Input
                            id="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                            placeholder="مثال: +970599123456"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="region">المنطقة *</Label>
                        <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر المنطقة" />
                            </SelectTrigger>
                            <SelectContent>
                                {deliveryRegions.map((region) => (
                                    <SelectItem key={region.name} value={region.name}>
                                        {region.name} - {region.price} ₪
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedRegion && (
                            <p className="text-sm text-heroes-red mt-1">
                                رسوم التوصيل: {selectedRegion.price} ₪
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="city">المدينة *</Label>
                        <Input
                            id="city"
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            placeholder="أدخل اسم المدينة"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="notes">ملاحظات</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="أي ملاحظات إضافية (اختياري)"
                            rows={3}
                        />
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span>إجمالي المنتجات:</span>
                            <span>{getTotalPrice().toFixed(2)} ₪</span>
                        </div>
                        {deliveryPrice > 0 && (
                            <div className="flex justify-between items-center mb-2">
                                <span>رسوم التوصيل:</span>
                                <span>{deliveryPrice.toFixed(2)}₪</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-lg font-semibold text-heroes-red">
                            <span>المجموع الكلي:</span>
                            <span>{totalPrice.toFixed(2)}₪</span>
                        </div>
                    </div>
                </form>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-heroes-red hover:bg-heroes-red/90"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'جاري إرسال الطلب...' : 'تأكيد الطلب'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CheckoutModal;