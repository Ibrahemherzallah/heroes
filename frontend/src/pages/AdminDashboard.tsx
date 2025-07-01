
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/contexts/CartContext';
import CategoryForm, { Category } from '@/components/CategoryForm';
import ProductEditForm from '@/components/ProductEditForm';
import ProductAddForm from '@/components/ProductAddForm';
import { Search, User } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([
    {
      id: 'REC001',
      name: 'رسيفر HD عالي الدقة',
      price: 299,
      salePrice: 249,
      isOnSale: true,
      description: 'رسيفر عالي الجودة يدعم القنوات المشفرة وغير المشفرة',
      image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=400&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop'
      ],
      category: 'receiver',
      isSoldOut: false
    }
  ]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [activeTab,setActiveTab] = useState('products')

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:4040/api/category');
        if (!res.ok) throw new Error('فشل تحميل الفئات');

        const data = await res.json();
        setCategories(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح",
    });
    navigate('/admin/login');
  };

  const handleAddProduct = (productData: Omit<Product, 'id'> & { id?: string }) => {
    // Check if product ID already exists
    if (products.some(p => p.id === productData.id)) {
      toast({
        title: "خطأ",
        description: "رقم المنتج موجود بالفعل",
        variant: "destructive"
      });
      return;
    }

    const product: Product = {
      ...productData,
      id: productData.id!,
      image: productData.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop',
      images: productData.images?.length ? productData.images : [productData.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop']
    };

    setProducts(prev => [...prev, product]);
    setShowProductForm(false);

    toast({
      title: "تم إضافة المنتج",
      description: `تم إضافة ${product.name} بنجاح`,
    });
  };

  const handleEditProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    setEditingProduct(null);
    toast({
      title: "تم تحديث المنتج",
      description: `تم تحديث ${product.name} بنجاح`,
    });
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({
      title: "تم حذف المنتج",
      description: "تم حذف المنتج بنجاح",
    });
  };

  const handleSaveCategory = async (category: Category) => {
    try {
      const method = category.id ? 'PUT' : 'POST';
      const url = category.id
          ? `http://localhost:4040/api/category/${category.id}`
          : `http://localhost:4040/api/category`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });

      if (!res.ok) throw new Error('فشل حفظ الفئة');

      const data = await res.json();
      toast({
        title: "تم الحفظ",
        description: `تم ${category.id ? 'تحديث' : 'إضافة'} الفئة بنجاح`,
      });

      setShowCategoryForm(false);
      // Refresh categories if needed
    } catch (err: any) {
      console.error(err);
      toast({
        title: "خطأ",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    try {
      const res = await fetch(`http://localhost:4040/api/category/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('فشل حذف الفئة');

      toast({
        title: 'تم الحذف',
        description: 'تم حذف الفئة بنجاح',
      });

      // Refresh the category list
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'خطأ',
        description: err.message,
        variant: 'destructive',
      });
    }
  };
  const filteredProducts = products.filter(product =>
    product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-heroes-red">
              لوحة إدارة Heroes
            </h1>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/admin/profile')}>
                <User className="h-4 w-4 mr-2" />
                الملف الشخصي
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                العودة للموقع
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">إدارة المنتجات</TabsTrigger>
            <TabsTrigger value="categories">إدارة الفئات</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
          </TabsList>

          <TabsContent value="products"  className="space-y-6">
            {/* Products List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>قائمة المنتجات ({filteredProducts.length})</CardTitle>
                  <div className="flex items-center gap-4">
                    <Button className="bg-heroes-red hover:bg-heroes-red/90" onClick={() => setShowProductForm(true)}>
                      إضافة منتج جديد
                    </Button>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input placeholder="البحث برقم أو اسم المنتج..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-64"/>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded"/>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{product.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {product.id}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-medium text-heroes-red">
                            {product.isOnSale && product.salePrice ? product.salePrice : product.price} ر.س
                          </span>
                          {product.isOnSale && <Badge variant="secondary">تخفيض</Badge>}
                          {product.isSoldOut && <Badge variant="destructive">نفدت الكمية</Badge>}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                        >
                          تعديل
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>إدارة الفئات ({categories.length})</CardTitle>
                  <Button
                      className="bg-heroes-red hover:bg-heroes-red/90"
                      onClick={() => setShowCategoryForm(true)}
                  >
                    إضافة فئة جديدة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <p>جاري التحميل...</p>
                ) : error ? (
                    <p className="text-red-500">⚠️ {error}</p>
                ) : (
                    <div className="space-y-4">
                      {categories.map((category) => (
                          <div key={category._id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <img src={category.image} alt={category.name} className="w-16 h-16 object-cover rounded"/>
                            <div className="flex-1">
                              <h3 className="font-semibold">{category.name}</h3>
                              <p className="text-sm text-gray-600">{category.description}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingCategory(category)}>
                                تعديل
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => deleteCategory(category._id)}>
                                حذف
                              </Button>
                            </div>
                          </div>
                      ))}
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>الطلبات الأخيرة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">لا توجد طلبات حالياً</p>
                  <p className="text-sm text-gray-400 mt-2">
                    سيتم عرض الطلبات هنا عند وجودها
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Product Dialog */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="max-w-4xl">
          <DialogHeader style={{textAlign:'start'}} >
            <DialogTitle>إضافة منتج جديد</DialogTitle>
          </DialogHeader>
          <ProductAddForm
            onSave={handleAddProduct}
            onCancel={() => setShowProductForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader style={{textAlign:'start'}}>
            <DialogTitle>تعديل المنتج</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductEditForm
              product={editingProduct}
              onSave={handleEditProduct}
              onCancel={() => setEditingProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Category Dialog */}
      <Dialog open={showCategoryForm || !!editingCategory} onOpenChange={() => {setShowCategoryForm(false);setEditingCategory(null);}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{textAlign:'start'}}>
              {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory || undefined}
            onSave={handleSaveCategory}
            onCancel={() => {
              setShowCategoryForm(false);
              setEditingCategory(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
