import {useEffect, useState} from 'react';
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
type OrderType = "store" | "whatsapp" | "loss"
type PricingType = "standard" | "custom"
const deliveryRegions = [
    { name: 'الضفة الغربية', price: 20 },
    { name: 'الداخل', price: 70 },
    { name: 'القدس', price: 30 },
    { name: 'ابو غوش', price: 50 }
];

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({fullName: '', phoneNumber: '', region: '', city: '', notes: ''});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {getTotalPrice, getFinalPrice, getDiscountAmount, selectedPointsDiscount,setSelectedPointsDiscount, clearCart, cartItems} = useCart();
    const token = localStorage.getItem('token');
    const [cashierRegion,setCashierRegion] = useState<string>('')
    const selectedRegion = deliveryRegions.find(region => region.name === formData.region || region.name === cashierRegion );
    const deliveryPrice = selectedRegion ? selectedRegion.price : 0;
    const [pricingType,setPricingType] = useState<"standard"|"custom">("standard")
    const [customPrice,setCustomPrice] = useState<number>(0)
    const [cashierCity,setCashierCity] = useState<string>('')
    const [orderType,setOrderType] = useState<"store"|"whatsapp"|"loss">("store")
    const totalPrice = orderType === 'loss' ? 0 : pricingType === 'custom' && customPrice ? customPrice + deliveryPrice : getFinalPrice() + deliveryPrice;
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const isWholesaler = user?.role === "wholesaler"
    const isUser = user?.role === "user"
    const isCashier = user?.role === "cashier"


    useEffect(() => {
        if (!isOpen) return;

        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);

            setFormData(prev => ({
                ...prev,
                fullName: parsedUser.userName || "",
                phoneNumber: parsedUser.phone || "",
            }));
        }
    }, [isOpen]);

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
        const totalPrice = getFinalPrice();

        const orderPayload = {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            region: formData.region,
            city: formData.city,
            notes: formData.notes,
            price: totalPrice,
            deliveryPrice: deliveryPrice,
            source: !user ? "زائر" : isWholesaler ? "تاجر" : isUser ? "زبون" : "ادمن",
            numOfItems,
            usedPoints: selectedPointsDiscount,
            products: cartItems.map(item => ({
                id: item._id,
                productId: item.id,
                image: item.image[0],
                name: item.productName,
                price: isWholesaler ? item.wholesalerPrice : item.isOnSale && item.salePrice ? item.salePrice : item.customerPrice,
                quantity: item.quantity,
                source: item.type
            }))
        };

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch(`${import.meta.env.VITE_ENV}/api/order`, {
                method: 'POST',
                headers,
                body: JSON.stringify(orderPayload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'فشل في إرسال الطلب');
            }

            // 2. Send WhatsApp message
            await fetch(`${import.meta.env.VITE_ENV}/api/order/send-whatsapp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...orderPayload,
                    type: 'Heroes Store' // optional: indicate the source of the order
                })
            });
            const data = await response.json();

            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }
            toast({
                title: "تم إرسال الطلب بنجاح",
                description: "سيتم التواصل معك قريباً لتأكيد الطلب"
            });
            setSelectedPointsDiscount(null);
            clearCart();
            setFormData({fullName: '', phoneNumber: '', region: '', city: '', notes: ''});
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

    const handleSubmitCashier = async (e: React.FormEvent) => {

        e.preventDefault();

        if(cartItems.length === 0){
            toast({
                title:"خطأ",
                description:"السلة فارغة",
                variant:"destructive"
            })
            return
        }

        if(pricingType === "custom" && !(customPrice > 0)){
            toast({
                title:"خطأ",
                description:"يرجى تحديد السعر المخصص",
                variant:"destructive"
            })
            return
        }

        if(orderType === "whatsapp"){
            if(!cashierRegion || !cashierCity){
                toast({
                    title:"خطأ",
                    description:"يرجى تحديد المنطقة والمدينة",
                    variant:"destructive"
                })
                return
            }
        }

        setIsSubmitting(true)

        const numOfItems = cartItems.reduce((t,i)=>t+i.quantity,0)

        let basePrice =
            orderType === "loss"
                ? 0
                : pricingType === "custom"
                    ? customPrice
                    : getFinalPrice()

        let finalDeliveryPrice = orderType === "whatsapp" ? deliveryPrice : 0

        const orderPayload = {

            fullName: orderType === "whatsapp" ? formData.fullName : "بيع من المتجر",
            phoneNumber: orderType === "whatsapp" ? formData.phoneNumber : "0000000000",

            region: orderType === "whatsapp" ? cashierRegion : "",
            city: orderType === "whatsapp" ? cashierCity : "",

            notes: formData.notes,

            price: basePrice,

            deliveryPrice: finalDeliveryPrice,

            orderType,

            pricingType,

            source: "متجر",

            numOfItems,

            usedPoints: 0,

            products: cartItems.map(item => ({
                id: item._id,
                productId: item.id,
                image: item.image[0],
                name: item.productName,
                price: item.customerPrice,
                quantity: item.quantity,
                source: item.type
            }))
        }

        try {

            const headers: Record<string,string> = {
                "Content-Type":"application/json"
            }

            if(token){
                headers.Authorization = `Bearer ${token}`
            }

            const response = await fetch(`${import.meta.env.VITE_ENV}/api/order`,{
                method:"POST",
                headers,
                body: JSON.stringify(orderPayload)
            })

            if(!response.ok){
                const data = await response.json()
                throw new Error(data.error || "فشل إنشاء الطلب")
            }

            toast({
                title:"تم إنشاء الطلب",
                description:"تم تسجيل العملية بنجاح"
            })

            clearCart()

            onClose()

        } catch(error:any){

            toast({
                title:"خطأ",
                description:error.message,
                variant:"destructive"
            })

        } finally{
            setIsSubmitting(false)
        }
    }

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
                    {
                        isCashier && (
                            <div className="space-y-4">

                                {/* Order Type */}

                                <div>

                                    <Label>نوع العملية</Label>

                                    <Select value={orderType} onValueChange={(v)=>setOrderType(v)}>

                                        <SelectTrigger>
                                            <SelectValue/>
                                        </SelectTrigger>

                                        <SelectContent>

                                            <SelectItem value="store">
                                                بيع من المتجر
                                            </SelectItem>

                                            <SelectItem value="whatsapp">
                                                طلب واتساب
                                            </SelectItem>

                                            <SelectItem value="loss">
                                                منتج صفري
                                            </SelectItem>

                                        </SelectContent>

                                    </Select>

                                </div>

                                {/* Pricing */}

                                {orderType !== "loss" && (

                                    <div>

                                        <Label>نوع السعر</Label>

                                        <Select value={pricingType} onValueChange={(v)=>setPricingType(v)}>

                                            <SelectTrigger>
                                                <SelectValue/>
                                            </SelectTrigger>

                                            <SelectContent>

                                                <SelectItem value="standard">
                                                    السعر العادي
                                                </SelectItem>

                                                <SelectItem value="custom">
                                                    سعر مخصص
                                                </SelectItem>

                                            </SelectContent>

                                        </Select>

                                    </div>

                                )}
                                { orderType === 'whatsapp' && (
                                    <>
                                        <div>
                                            <Label htmlFor="region">المنطقة *</Label>
                                            <Select value={cashierRegion} onValueChange={(value) => setCashierRegion(value)}>
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
                                            <Input id="city" type="text" value={cashierCity} onChange={(e) => setCashierCity(e.target.value)} placeholder="أدخل اسم المدينة" required/>
                                        </div>
                                    </>
                                )

                                }

                                {/* Custom price */}

                                {pricingType === "custom" && orderType !== "loss" && (

                                    <div>
                                        <Label>السعر المخصص</Label>
                                        <Input type="number" value={customPrice} onChange={(e)=>setCustomPrice(Number(e.target.value))}/>
                                    </div>

                                )}

                            </div>
                        )
                    }
                    {
                        !isCashier && (
                            <>
                                <div>
                                    <Label htmlFor="fullName">الاسم الكامل *</Label>
                                    <Input id="fullName" type="text" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} placeholder="أدخل الاسم الكامل" required/>
                                </div>

                                <div>
                                    <Label htmlFor="phoneNumber">رقم الهاتف (مع المقدمة) *</Label>
                                    <Input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} placeholder="مثال: +970599123456" required/>
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
                                    <Input id="city" type="text" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} placeholder="أدخل اسم المدينة" required/>
                                </div>
                            </>
                        )
                    }
                    <div>
                        <Label htmlFor="notes">ملاحظات</Label>
                        <Textarea id="notes" value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="أي ملاحظات إضافية (اختياري)" rows={3}/>
                    </div>
                    {selectedPointsDiscount && (
                        <div className="flex justify-between items-center mb-2 text-green-600">
                            <span>خصم النقاط ({selectedPointsDiscount}%):</span>
                            <span>-{getDiscountAmount().toFixed(2)} ₪</span>
                        </div>
                    )}
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span>إجمالي المنتجات:</span>
                            <span>{ isCashier && customPrice > 0 ? customPrice : getTotalPrice().toFixed(2)} ₪</span>
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
                <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md text-sm">
                    ملاحظة: بمجرد الضغط على زر الإرسال سيتم إرسال الطلب إلى شركة التوصيل وسيتم إيصال الطرد في أقرب وقت ممكن.
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        إلغاء
                    </Button>
                    <Button onClick={isCashier ? handleSubmitCashier : handleSubmit} className="bg-heroes-red hover:bg-heroes-red/90" disabled={isSubmitting}>
                        {isSubmitting ? 'جاري إرسال الطلب...' : 'تأكيد الطلب'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CheckoutModal;