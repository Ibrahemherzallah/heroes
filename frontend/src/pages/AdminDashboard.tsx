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


interface Order {
  _id: string;
  fullName: string;
  phoneNumber: string;
  region: string;
  city: string;
  notes?: string;
  price: number;
  deliveryPrice: number;
  numOfItems: number;
  productId: string;
  createdAt: string;
}



const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [activeTab,setActiveTab] = useState('products')
  const [orders, setOrders] = useState<Order[]>([]);
  const token = localStorage.getItem('adminToken');
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const isLoggedIn = localStorage.getItem('adminLoggedIn');

    if (!token || isLoggedIn !== 'true') {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('https://heroess.top/api/category');
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
    if(activeTab === 'products') {
      const fetchProducts = async () => {
        try {
          const res = await fetch('https://heroess.top/api/product');
          if (!res.ok) throw new Error('فشل تحميل الفئات');

          const data = await res.json();
          setProducts(data);
        } catch (err: any) {
          console.error(err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts()
    }
    if(activeTab === 'orders') {
      const fetchOrders = async () => {
        try {
          const res = await fetch(`https://heroess.top/api/order`);
          const data = await res.json();
          setOrders(data);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      };

      fetchOrders();
    }
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

  const handleSaveProduct = async (product: Product) => {
    try {
      const res = await fetch('https://heroess.top/api/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(product),
      });

      if (!res.ok) {
        throw new Error('فشل حفظ المنتج');
      }

      const data = await res.json();
      toast({
        title: 'تم الحفظ',
        description: 'تم إضافة المنتج بنجاح',
      });
      setShowProductForm(false);
      // Refresh product list, close modal, etc.
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'خطأ',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditProduct = async (product: Product) => {
    console.log("PRODUCT SI : " , product._id)
    try {
      const res = await fetch(`https://heroess.top/api/product/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(product),
      });

      if (!res.ok) {
        throw new Error('فشل تحديث المنتج');
      }

      const updatedProduct = await res.json();

      setProducts(prev =>
          prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      setEditingProduct(null);
      toast({
        title: "تم تحديث المنتج",
        description: `تم تحديث ${updatedProduct.productName} بنجاح`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "خطأ",
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`https://heroess.top/api/product/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
      });

      if (!res.ok) {
        throw new Error('فشل حذف المنتج');
      }

      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "تم حذف المنتج",
        description: "تم حذف المنتج بنجاح",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "خطأ",
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveCategory = async (category: Category) => {
    console.log("category.id in is : ", category.id)
    console.log("category.id in is : ", category)

    try {
      const method = category.id ? 'PUT' : 'POST';
      const url = category.id
          ? `https://heroess.top/api/category/${category.id}`
          : `https://heroess.top/api/category`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(category),
      });

      if (!res.ok) throw new Error('فشل حفظ الفئة');

      const data = await res.json();
      toast({
        title: "تم الحفظ",
        description: `تم ${category.id ? 'تحديث' : 'إضافة'} الفئة بنجاح`,
      });
      setEditingCategory(false);
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
      const res = await fetch(`https://heroess.top/api/category/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
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
    product.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-heroes-red">
              لوحة إدارة Heroes
            </h1>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>قائمة المنتجات ({filteredProducts.length})</CardTitle>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
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
                      <img src={product.image} alt={product.productName} className="w-16 h-16 object-cover rounded"/>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{product.productName}</h3>
                          <Badge variant="outline" className="text-xs">
                            {product.id}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{product.categoryId.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-medium text-heroes-red">
                            {product.isOnSale && product.salePrice ? product.salePrice : product.customerPrice} ₪
                          </span>
                          {product.isOnSale && <Badge variant="secondary">تخفيض</Badge>}
                          {product.isSoldOut && <Badge variant="destructive">نفدت الكمية</Badge>}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                          تعديل
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteProduct(product.id)}>
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
                {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">لا توجد طلبات حالياً</p>
                      <p className="text-sm text-gray-400 mt-2">
                        سيتم عرض الطلبات هنا عند وجودها
                      </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                          <div key={order._id} className="border p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-lg font-semibold">{order.fullName}</h3>
                              <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
                            </div>
                            <p><strong>الهاتف :</strong><span style={{opacity:'0'}}>s</span><span>{order.phoneNumber}</span> </p>
                            <p><strong>  المنطقة :</strong><span style={{opacity:'0'}}>s</span>{order.region} - {order.city} </p>
                            <p><strong>السعر :</strong><span style={{opacity:'0'}}>s</span> {order.price}₪</p>
                            <p><strong>التوصيل :</strong><span style={{opacity:'0'}}>s</span> {order.deliveryPrice}₪</p>
                            {order.notes && <p><strong>ملاحظات :</strong><span style={{opacity:'0'}}>s</span> {order.notes}</p>}
                            <p><strong>المنتجات :</strong></p>
                            <ul className="list-disc pl-5">
                              {order?.products?.map((p, i) => (
                                  <li key={i}> PID: {p.productId} - Amount:{p.quantity} </li>
                              ))}
                            </ul>
                          </div>
                      ))}
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>        </Tabs>
      </main>

      {/* Add Product Dialog */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="max-w-4xl">
          <DialogHeader style={{textAlign:'start'}} >
            <DialogTitle>إضافة منتج جديد</DialogTitle>
          </DialogHeader>
          <ProductAddForm
            onSave={handleSaveProduct}
            categories={categories}
            onCancel={() => setShowProductForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() =>{setShowProductForm(false); setEditingProduct(null)}}>
        <DialogContent className="max-w-4xl">
          <DialogHeader style={{textAlign:'start'}}>
            <DialogTitle>تعديل المنتج</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductEditForm
              product={editingProduct}
              categories={categories}
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
