
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/contexts/CartContext';
import { Upload, X } from 'lucide-react';

interface ProductAddFormProps {
  onSave: (product: Omit<Product, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

const ProductAddForm: React.FC<ProductAddFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    salePrice: '',
    description: '',
    image: '',
    images: [] as string[],
    category: '',
    isOnSale: false,
    isSoldOut: false
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imagePreviews.length + files.length > 5) {
      toast({
        title: "خطأ",
        description: "يمكن إضافة 5 صور كحد أقصى للمنتج الواحد",
        variant: "destructive"
      });
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreviews(prev => [...prev, result]);
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, result],
          image: prev.image || result // Set first image as main image
        }));
      };
      reader.readAsDataURL(file);
    });

    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      setFormData(prevData => ({
        ...prevData,
        images: newPreviews,
        image: newPreviews[0] || ''
      }));
      return newPreviews;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id || !formData.name || !formData.price || !formData.category) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
    };

    onSave(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">رقم المنتج *</label>
        <Input value={formData.id} onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))} placeholder="مثال: REC001" required/>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">اسم المنتج *</label>
        <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="اسم المنتج" required/>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">السعر *</label>
        <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} placeholder="0.00" required/>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">الفئة *</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} required>
          <option value="">اختر الفئة</option>
          <option value="receiver">أجهزة الاستقبال</option>
          <option value="cameras">كاميرات المراقبة</option>
          <option value="mobile-accessories">إكسسوارات الجوال</option>
          <option value="computer-accessories">إكسسوارات الكمبيوتر</option>
          <option value="internet-subscription">اشتراكات الإنترنت</option>
          <option value="electronic-items">الأجهزة الإلكترونية</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-2">صور المنتج (حتى 5 صور)</label>
        <div className="space-y-4">
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img src={preview} alt={`معاينة ${index + 1}`} className="w-full h-24 object-cover rounded-lg border"/>
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeImage(index)} className="absolute top-1 right-1 h-6 w-6 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {imagePreviews.length < 5 && (
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  اختر صور للمنتج ({imagePreviews.length}/5)
                </p>
              </div>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="new-product-images-upload"/>
              <label
                htmlFor="new-product-images-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                اختيار صور
              </label>
            </>
          )}
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-2">الوصف</label>
        <Textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="وصف المنتج" rows={3}/>
      </div>

      <div className="flex items-center space-x-2 space-x-reverse">
        <Checkbox id="isOnSale" checked={formData.isOnSale} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOnSale: !!checked }))}/>
        <label htmlFor="isOnSale" className="text-sm font-medium">
          في التخفيض
        </label>
      </div>

      {formData.isOnSale && (
        <div>
          <label className="block text-sm font-medium mb-2">سعر التخفيض</label>
          <Input type="number" step="0.01" value={formData.salePrice} onChange={(e) => setFormData(prev => ({ ...prev, salePrice: e.target.value }))} placeholder="0.00"/>
        </div>
      )}

      <div className="flex items-center space-x-2 space-x-reverse">
        <Checkbox id="isSoldOut" checked={formData.isSoldOut} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isSoldOut: !!checked }))}/>
        <label htmlFor="isSoldOut" className="text-sm font-medium">
          نفدت الكمية
        </label>
      </div>

      <div className="md:col-span-2 flex gap-2">
        <Button type="submit" className="bg-heroes-red hover:bg-heroes-red/90">
          إضافة المنتج
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
};

export default ProductAddForm;
