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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import WholesalerForm from "@/components/WholesalerForm.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";

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
  const [activeUsersTab,setActiveUsersTab] = useState('products')
  const [orders, setOrders] = useState<Order[]>([]);
  const [normalUsers, setNormalUsers] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [showWholesalerModal, setShowWholesalerModal] = useState(false);
  const [search, setSearch] = useState("");
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const [editingWholesaler, setEditingWholesaler] = useState(null);

  const token = localStorage.getItem('token');

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_ENV}/api/order`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch(`${import.meta.env.VITE_ENV}/api/auth/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    setNormalUsers(data.filter((u) => u.role === "user"));
    setWholesalers(data.filter((u) => u.role === "wholesaler"));
  };


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_ENV}/api/product`);
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
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_ENV}/api/category`);
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

      fetchProducts()
    }
    if(activeTab === 'categories') {

      fetchCategories()
    }
    if(activeTab === 'orders') {
      fetchOrders();
    }
    if(activeTab === 'users') {
      fetchUsers();
    }
    fetchCategories()
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح",
    });
    navigate('/admin/login');
  };

  const handleSaveProduct = async (product: Product) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_ENV}/api/product`, {
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
    try {
      const res = await fetch(`${import.meta.env.VITE_ENV}/api/product/${product._id}`, {
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
      const res = await fetch(`${import.meta.env.VITE_ENV}/api/product/${id}`, {
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
          ? `${import.meta.env.VITE_ENV}/api/category/${category.id}`
          : `${import.meta.env.VITE_ENV}/api/category`;

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
      const res = await fetch(`${import.meta.env.VITE_ENV}/api/category/${id}`, {
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

  const toggleFeatured = async (productId: string) => {
    try {
      // 🔥 Call backend toggle endpoint
      const response = await fetch(
          `${import.meta.env.VITE_ENV}/api/product/${productId}/toggle-featured`,
          {
            method: "PATCH",
            headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${token}`
            }
          }
      );

      if (!response.ok) {
        throw new Error("Failed to update featured status");
      }

      const data = await response.json();

      // ✅ Update UI using returned product from backend
      setProducts((prevProducts) =>
          prevProducts.map((p) =>
              p._id === productId ? data.product : p
          )
      );
    } catch (error) {
      console.error("Error updating featured status", error);
    }
  };

  const saveNewOrder = async (products) => {
    await fetch(`${import.meta.env.VITE_ENV}/api/product/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(products.map((p, index) => ({
        id: p.id,
        sortOrder: index
      })))
    });
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(
          `${import.meta.env.VITE_ENV}/api/order/${id}/status`,
          { status: "shipped" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );
      await fetchOrders(); // reload
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddWholesaler = async (data) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_ENV}/api/auth/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          role: "wholesaler",
        }),
      });

      const result = await res.json(); // 🔥 read response body

      if (!res.ok) {
        toast({
          title: "خطأ",
          description: result.message || "حدث خطأ أثناء إضافة التاجر",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "تم بنجاح",
        description: result.message || "تم إضافة تاجر الجملة",
      });

      setShowWholesalerModal(false);
      fetchUsers();

    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الاتصال بالخادم",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف الطلب؟")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
          `${import.meta.env.VITE_ENV}/api/order/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteUser = async (id: string) => {
    const confirmDelete = window.confirm("هل أنت متأكد من حذف المستخدم؟");

    if (!confirmDelete) return;

    try {
      setLoadingDelete(id);

      const res = await fetch(
          `${import.meta.env.VITE_ENV}/api/auth/users/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "خطأ",
          description: data.message || "فشل حذف المستخدم",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "تم بنجاح",
        description: "تم حذف المستخدم",
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoadingDelete(null);
    }
  };

  const filteredNormalUsers = normalUsers.filter((user) =>
      user.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredWholesalers = wholesalers.filter((user) =>
      user.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditWholesaler = (user) => {
    setEditingWholesaler(user);
    setShowWholesalerModal(true);
  };

  const handleUpdateWholesaler = async (data) => {
    try {
      const res = await fetch(
          `${import.meta.env.VITE_ENV}/api/auth/users/${data.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userName: data.userName,
              phone: data.phone,
              password: data.password,
              dob: data.dob,
            }),
          }
      );

      const result = await res.json();

      if (!res.ok) {
        toast({
          title: "خطأ",
          description: result.message || "حدث خطأ أثناء التحديث",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "تم بنجاح",
        description: result.message || "تم تحديث التاجر",
      });

      setShowWholesalerModal(false);
      setEditingWholesaler(null);
      fetchUsers();

    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الاتصال بالخادم",
        variant: "destructive",
      });
    }
  };


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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">إدارة المنتجات</TabsTrigger>
            <TabsTrigger value="categories">إدارة الفئات</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
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
                      <Input
                          placeholder="البحث برقم أو اسم المنتج..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DragDropContext
                    onDragEnd={async (result) => {
                      if (!result.destination) return;
                      const reordered = Array.from(filteredProducts);
                      const [moved] = reordered.splice(result.source.index, 1);
                      reordered.splice(result.destination.index, 0, moved);
                      setProducts(reordered);
                      await saveNewOrder(reordered);
                    }}
                >
                  <Droppable droppableId="products">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                        >
                          {filteredProducts.map((product, index) => (
                              <Draggable
                                  key={product.id}
                                  draggableId={product.id.toString()}
                                  index={index}
                              >
                                {(provided) => (
                                    <div
                                        className="flex items-center gap-4 p-4 border rounded-lg bg-white"
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                    >
                                      <img
                                          src={product.image}
                                          alt={product.productName}
                                          className="w-16 h-16 object-cover rounded"
                                      />

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
                                            {product.isOnSale && product.salePrice
                                                ? product.salePrice
                                                : product.customerPrice}{" "}
                                            ₪
                                          </span>
                                          {product.isOnSale && (
                                              <Badge variant="secondary">تخفيض</Badge>
                                          )}
                                          {product.isSoldOut && (
                                              <Badge variant="destructive">نفدت الكمية</Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-2">
                                          <span className="text-sm">مميز</span>

                                          <Switch
                                              checked={product.isFeatured || false}
                                              onCheckedChange={() =>
                                                  toggleFeatured(product._id)
                                              }
                                          />
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
                                )}
                              </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                    )}
                  </Droppable>
                </DragDropContext>
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
                          <div
                              key={order._id}
                              className={`border p-4 rounded-lg shadow-sm bg-white transition-all duration-300
                               ${
                                  order.status === "shipped"
                                      ? "opacity-60"
                                      : order.status === "delivered"
                                          ? "opacity-40"
                                          : "opacity-100"
                              }`}
                          >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-lg font-semibold">
                                {order.fullName}
                              </h3>

                              <div className="flex items-center gap-3">
                                {/* Status Badge */}
                                <span
                                    className={`text-xs px-3 py-1 rounded-full font-medium
                                    ${
                                        order.status === "ordered"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : order.status === "shipped"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-green-100 text-green-700"
                                    }`}
                                >
                                  {order.status}
                                </span>

                                <span className="text-sm text-gray-500">
                                  {new Date(order.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Order Info */}
                            <p><strong>الهاتف :</strong> {order.phoneNumber}</p>
                            <p><strong>المنطقة :</strong> {order.region} - {order.city}</p>
                            <p><strong>السعر :</strong> {order.price}₪</p>
                            <p><strong>التوصيل :</strong> {order.deliveryPrice}₪</p>
                            <p><strong>المصدر :</strong> {order.source}₪</p>

                            {order.notes && (
                                <p><strong>ملاحظات :</strong> {order.notes}</p>
                            )}

                            {/* Products */}
                            <p className="mt-2"><strong>المنتجات :</strong></p>
                            <ul className="list-disc pl-5">
                              {order?.products?.map((p, i) => (
                                  <li key={i}>
                                    PID: {p.productId} - Amount: {p.quantity}
                                  </li>
                              ))}
                            </ul>

                            {/* Admin Actions */}
                            <div className="flex items-center justify-between mt-4">
                              {/* Modern Checkbox */}
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={order.status !== "ordered"}
                                    disabled={order.status !== "ordered"}
                                    onCheckedChange={() => handleStatusChange(order._id)}
                                />
                                <label className="text-sm font-medium leading-none cursor-pointer">
                                  تحديد الطلب كشحن
                                </label>
                              </div>

                              {/* Delete Button */}
                              <button
                                  onClick={() => handleDelete(order._id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                              >
                                حذف الطلب
                              </button>
                            </div>
                          </div>
                      ))}
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">

                <Tabs defaultValue="normalUsers" onValueChange={setActiveUsersTab} className="space-y-6">

                  {/* Tabs */}
                  <TabsList>
                    <TabsTrigger value="normalUsers">زبائن</TabsTrigger>
                    <TabsTrigger value="wholesalers">تجار</TabsTrigger>
                  </TabsList>

                  {/* Search */}
                  <div className={'flex justify-between'}>
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-md"
                    />
                    { activeUsersTab === 'wholesalers' && (
                        <Button className="bg-heroes-red hover:bg-heroes-red/90" onClick={() => setShowWholesalerModal(true)}>
                          إضافة تاجر جملة
                        </Button>
                    )}

                  </div>

                  {/* ================= USERS TABLE ================= */}
                  <TabsContent value="normalUsers">
                    <div className="rounded-xl border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Date of Birth</TableHead>
                            <TableHead>Total Orders</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {filteredNormalUsers.map((user) => (
                              <TableRow key={user._id}>
                                <TableCell className="font-medium">
                                  {user.userName}
                                </TableCell>
                                <TableCell>{user.phone}</TableCell>
                                <TableCell>{user.dob || "-"}</TableCell>
                                <TableCell>{user.orderHistory.length || 0}</TableCell>

                                <TableCell>
                                  <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                    Active
                                  </span>
                                </TableCell>

                                <TableCell className="text-right">
                                  <Button
                                      variant="destructive"
                                      size="sm"
                                      className="ml-2"
                                      onClick={() => deleteUser(user._id)}
                                  >
                                    Delete
                                  </Button>
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  {/* ================= WHOLESALERS TABLE ================= */}
                  <TabsContent value="wholesalers">
                    <div className="rounded-xl border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Date of Birth</TableHead>
                            <TableHead>Total Orders</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {filteredWholesalers.map((user) => (
                              <TableRow key={user._id}>
                                <TableCell className="font-medium">
                                  {user.userName}
                                </TableCell>
                                <TableCell>{user.phone}</TableCell>
                                <TableCell>{user.dob || "-"}</TableCell>
                                <TableCell>{user.orderHistory.length || 0}</TableCell>
                                <TableCell>
                                  <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                    Active
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditWholesaler(user)}
                                  >
                                    Edit
                                  </Button>

                                  <Button
                                      variant="destructive"
                                      size="sm"
                                      className="ml-2"
                                      onClick={() => deleteUser(user._id)}
                                  >
                                    Delete
                                  </Button>
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                </Tabs>
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
            onSave={handleSaveProduct}
            categories={categories}
            onCancel={() => setShowProductForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Add Wholesaler Dialog */}
      <Dialog open={showWholesalerModal} onOpenChange={setShowWholesalerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{textAlign:'start', marginBottom:'1rem'}}>
              {editingWholesaler ? "تعديل تاجر جملة" : "إضافة تاجر جملة"}
            </DialogTitle>
          </DialogHeader>
          <WholesalerForm
              user={editingWholesaler}
              defaultRole="wholesaler"
              onSave={editingWholesaler ? handleUpdateWholesaler : handleAddWholesaler}
              onCancel={() => {
                setShowWholesalerModal(false);
                setEditingWholesaler(null);
              }}
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
