import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/contexts/CartContext';
import { Upload, X } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase';
interface ProductAddFormProps {
  onSave: (product: Omit<Product, 'id'> & { id?: string }) => void;
  onCancel: () => void;
  categories: any
}

const ProductAddForm: React.FC<ProductAddFormProps> = ({ onSave, onCancel, categories }) => {
  const [formData, setFormData] = useState<Product>({
    id: '',
    productName: '',
    customerPrice: 0,
    salePrice: 0,
    isOnSale: false,
    description: '',
    image: [],
    categoryId: '',
    isSoldOut: false,
    url: '',
    properties: []
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [propertyInput, setPropertyInput] = useState<string>('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imagePreviews.length > 5) {
      toast({
        title: 'خطأ',
        description: 'يمكن تحميل حتى 5 صور فقط',
        variant: 'destructive',
      });
      return;
    }

    const uploadPromises = files.map(async (file) => {
      const storageRef = ref(storage, `products/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            () => {},
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
        );
      });
    });

    try {
      const urls = await Promise.all(uploadPromises);
      setImagePreviews((prev) => [...prev, ...urls]);
      setFormData((prev) => ({
        ...prev,
        image: [...prev.image, ...urls], // array of URLs
      }));
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء رفع الصور',
        variant: 'destructive',
      });
    }
  };

  const handleAddProperty = () => {
    if (propertyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        properties: [...(prev.properties || []), propertyInput.trim()],
      }));
      setPropertyInput('');
    }
  };

  const handleRemoveProperty = (index: number) => {
    setFormData(prev => {
      const updated = [...(prev.properties || [])];
      updated.splice(index, 1);
      return { ...prev, properties: updated };
    });
  };
  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        image: newPreviews,
      }));
      return newPreviews;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id || !formData.productName || !formData.customerPrice || !formData.categoryId || formData.image.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    const productData = {
      id: formData.id,
      productName: formData.productName,
      categoryId: formData.categoryId,
      image: formData.image,
      customerPrice: formData.customerPrice,
      salePrice: formData.salePrice,
      isSoldOut: formData.isSoldOut,
      isOnSale: formData.isOnSale,
      description: formData.description,
      url: formData.url,
      properties: formData.properties,
    };


    onSave(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
      <div>
        <label className="block text-sm font-medium mb-2">رقم المنتج *</label>
        <Input value={formData.id} onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))} placeholder="مثال: REC001" required/>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">اسم المنتج *</label>
        <Input value={formData.productName} onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))} placeholder="اسم المنتج" required/>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">السعر *</label>
        <Input type="number" step="0.01" value={formData.customerPrice} onChange={(e) => setFormData(prev => ({ ...prev, customerPrice: e.target.value }))} placeholder="0.00" required/>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">الفئة *</label>
        <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={formData.categoryId}
            onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
            required
        >
          <option value="">اختر الفئة</option>
          {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
          ))}
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
              <label htmlFor="new-product-images-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Upload className="h-4 w-4 mr-2" />
                اختيار صور
              </label>
            </>
          )}
        </div>
      </div>




      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-2">رابط المنتج (اختياري)</label>
        <Input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://example.com"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-2">الخصائص (اختياري)</label>
        <div className="flex gap-2 mb-2">
          <Input
              value={propertyInput}
              onChange={(e) => setPropertyInput(e.target.value)}
              placeholder="مثال: لون أحمر، حجم متوسط"
          />
          <Button type="button" onClick={handleAddProperty}>
            إضافة
          </Button>
        </div>
        {formData.properties && formData.properties.length > 0 && (
            <ul className="space-y-1">
              {formData.properties.map((prop, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <span>{prop}</span>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveProperty(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
              ))}
            </ul>
        )}
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
          <Input type="number" step="0.01" value={formData.salePrice} onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    salePrice: parseFloat(e.target.value) || 0
                  }))
              } placeholder="0.00"/>
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
