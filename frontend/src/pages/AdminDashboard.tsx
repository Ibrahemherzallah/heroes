import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
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
import { Trash2 } from "lucide-react";

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
  usedPoints: number;
  status: any;
  source: any;

}

const FinanceCard = ({title, value,}: { title: string; value?: number; }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value ?? 0} ₪</p>
      </CardContent>
    </Card>
);


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [activeUsersTab, setActiveUsersTab] = useState("products");
  const [orders, setOrders] = useState<Order[]>([]);
  const [normalUsers, setNormalUsers] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [showWholesalerModal, setShowWholesalerModal] = useState(false);
  const [search, setSearch] = useState("");
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const [editingWholesaler, setEditingWholesaler] = useState(null);

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isCashier = user?.role === "cashier";

// Finance
  const [financeSummary, setFinanceSummary] = useState<any>(null);
  const [monthlyReport, setMonthlyReport] = useState<any[]>([]);
  const [financialTransactions, setFinancialTransactions] = useState<any[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<any[]>([]);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  // const [recentOrderFinance, setRecentOrderFinance] = useState<any[]>([]);

  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeError, setFinanceError] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

// Dialogs
  const [showManualRevenueDialog, setShowManualRevenueDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showOpeningBalanceDialog, setShowOpeningBalanceDialog] = useState(false);

// Forms
  const [manualRevenueAmount, setManualRevenueAmount] = useState<number | "">("");
  const [manualRevenueDescription, setManualRevenueDescription] = useState("");

  const [expenseAmount, setExpenseAmount] = useState<number | "">("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("other");

  const [openingBalanceAmount, setOpeningBalanceAmount] = useState<number | "">("");
  const [openingBalanceDescription, setOpeningBalanceDescription] = useState("");

  const [lastExpenses, setLastExpenses] = useState<any[]>([]);
  const [lastManualRevenues, setLastManualRevenues] = useState<any[]>([]);
  const [recentOrderFinance, setRecentOrderFinance] = useState<any[]>([]);


  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_ENV}/api/order`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

  const filteredNormalUsers = normalUsers.filter((user) => user.userName?.toLowerCase().includes(search.toLowerCase()));

  const filteredWholesalers = wholesalers.filter((user) => user.userName?.toLowerCase().includes(search.toLowerCase()));

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

  const resetPassword = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
          `${import.meta.env.VITE_ENV}/api/auth/reset-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId }),
          }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert(`كلمة المرور الجديدة: ${data.newPassword}`);

    } catch (error) {
      alert("فشل في إعادة تعيين كلمة المرور");
    }
  };

  const fetchFinanceSummary = async () => {
    const res = await fetch(`${import.meta.env.VITE_ENV}/api/finance/summary`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error("فشل تحميل الملخص المالي");

    const data = await res.json();
    setFinanceSummary(data);
  };

  const fetchMonthlyReport = async (year: number) => {
    const res = await fetch(
        `${import.meta.env.VITE_ENV}/api/finance/monthly-report?year=${year}`,
        {
          headers: getAuthHeaders(),
        }
    );

    if (!res.ok) throw new Error("فشل تحميل التقرير الشهري");

    const data = await res.json();
    setMonthlyReport(data.report || []);
  };

  const fetchFinancialTransactions = async () => {
    const res = await fetch(`${import.meta.env.VITE_ENV}/api/finance/transactions-finance`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error("فشل تحميل الحركات المالية");

    const data = await res.json();
    setFinancialTransactions(data.transactions || []);
  };

  const fetchInventoryTransactions = async () => {
    const res = await fetch(`${import.meta.env.VITE_ENV}/api/finance/transactions-inventory`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error("فشل تحميل حركات المخزون");

    const data = await res.json();
    setInventoryTransactions(data.transactions || []);
  };

  const fetchLastExpenses = async () => {
    const res = await fetch(
        `${import.meta.env.VITE_ENV}/api/finance/transactions?type=expense&limit=10`,
        {
          headers: getAuthHeaders(),
        }
    );

    if (!res.ok) throw new Error("فشل تحميل آخر المصاريف");

    const data = await res.json();
    setLastExpenses(data.transactions || []);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المصروف؟")) return;

    try {
      setDeletingExpenseId(id);

      const res = await fetch(
          `${import.meta.env.VITE_ENV}/api/finance/transactions/${id}`,
          {
            method: "DELETE",
            headers: getAuthHeaders(),
          }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل حذف المصروف");
      }

      toast({
        title: "تم الحذف",
        description: "تم حذف المصروف بنجاح",
      });

      // تحديث القائمة مباشرة
      setLastExpenses((prev) => prev.filter((e) => e._id !== id));

      // أو لو عندك fetch:
      // await fetchFinanceData();

    } catch (err: any) {
      console.error(err);
      toast({
        title: "خطأ",
        description: err.message || "حدث خطأ أثناء الحذف",
        variant: "destructive",
      });
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const fetchLastManualRevenues = async () => {
    const res = await fetch(
        `${import.meta.env.VITE_ENV}/api/finance/transactions?type=manualRevenue&limit=10`,
        {
          headers: getAuthHeaders(),
        }
    );

    if (!res.ok) throw new Error("فشل تحميل آخر الإيرادات اليدوية");

    const data = await res.json();
    setLastManualRevenues(data.transactions || []);
  };

  const fetchRecentOrderFinance = async () => {
    const res = await fetch(
        `${import.meta.env.VITE_ENV}/api/order/recent-orders?limit=10`,
        {
          headers: getAuthHeaders(),
        }
    );

    if (!res.ok) throw new Error("فشل تحميل آخر الطلبات المالية");

    const data = await res.json();
    setRecentOrderFinance(data.orders || []);
  };

  const fetchFinanceData = async () => {
    try {
      setFinanceLoading(true);
      setFinanceError("");

      await Promise.all([
        fetchFinanceSummary(),
        fetchMonthlyReport(selectedYear),
        fetchFinancialTransactions(),
        fetchInventoryTransactions(),
        fetchRecentOrderFinance(),
        fetchLastManualRevenues(),
        fetchLastExpenses(),
      ]);
    } catch (err: any) {
      console.error(err);
      setFinanceError(err.message || "حدث خطأ أثناء تحميل البيانات المالية");
    } finally {
      setFinanceLoading(false);
    }
  };

  const resetManualRevenueForm = () => {
    setManualRevenueAmount("");
    setManualRevenueDescription("");
  };

  const resetExpenseForm = () => {
    setExpenseAmount("");
    setExpenseDescription("");
    setExpenseCategory("other");
  };

  const resetOpeningBalanceForm = () => {
    setOpeningBalanceAmount("");
    setOpeningBalanceDescription("");
  };

  const handleAddManualTransaction = async ({type, amount, description, category,}: { type: "manualRevenue" | "expense" | "openingBalance"; amount: number; description: string; category?: string; }) => {
    try {
      const res = await fetch(
          `${import.meta.env.VITE_ENV}/api/finance/manual-transaction`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              type,
              amount,
              description,
              category,
            }),
          }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل إضافة الحركة المالية");
      }

      toast({
        title: "تم بنجاح",
        description: "تمت إضافة الحركة المالية",
      });

      await fetchFinanceData();

      if (type === "manualRevenue") {
        setShowManualRevenueDialog(false);
        resetManualRevenueForm();
      }

      if (type === "expense") {
        setShowExpenseDialog(false);
        resetExpenseForm();
      }

      if (type === "openingBalance") {
        setShowOpeningBalanceDialog(false);
        resetOpeningBalanceForm();
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "خطأ",
        description: err.message || "حدث خطأ أثناء إضافة الحركة المالية",
        variant: "destructive",
      });
    }
  };

  const handleRetrieveOrder = async (orderId: string) => {
    console.log("the order id is : ", orderId);
    if (!confirm("هل أنت متأكد من استرجاع هذا الطلب؟ سيتم إعادة الكميات إلى المخزون وعكس الأثر المالي.")) {
      return;
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(
          `${import.meta.env.VITE_ENV}/api/order/${orderId}/retrieve`,
          {
            method: "PATCH",
            headers,
          }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل استرجاع الطلب");
      }

      toast({
        title: "تم بنجاح",
        description: "تم استرجاع الطلب وإعادة الكميات للمخزون",
      });

      setOrders((prev) =>
          prev.map((order) =>
              order._id === orderId
                  ? { ...order, status: "retrieved", isRetrieved: true, retrievedAt: new Date().toISOString() }
                  : order
          )
      );

      await fetchFinanceData?.();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء استرجاع الطلب",
        variant: "destructive",
      });
    }
  };

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

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }

    if (activeTab === "users") {
      fetchUsers();
    }

    if (activeTab === "finance") {
      fetchFinanceData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "finance") return;

    fetchMonthlyReport(selectedYear).catch((err: any) => {
      console.error(err);
      setFinanceError(err.message || "فشل تحميل التقرير الشهري");
    });
  }, [selectedYear, activeTab]);


  const mergedRecentRevenues = [
    ...recentOrderFinance.map((order) => ({
      kind: "order" as const,
      _id: order._id,
      createdAt: order.createdAt,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      productRevenue: order.productRevenue,
      cogs: order.cogs,
      status: order.status,
      productProfit: order.productProfit,
      deliveryPrice: order.deliveryPrice,
      deliveryRevenue: order.deliveryRevenue,
      totalRevenue: order.totalRevenue,
    })),
    ...lastManualRevenues.map((revenue) => ({
      kind: "manual" as const,
      _id: revenue._id,
      createdAt: revenue.createdAt,
      description: revenue.description,
      amount: revenue.amount,
      category: revenue.category,
    })),
  ].sort(
      (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
          <TabsList className={`grid w-full ${isCashier ? 'grid-cols-4' : 'grid-cols-5' }`}>
            <TabsTrigger value="products">إدارة المنتجات</TabsTrigger>
            <TabsTrigger value="categories">إدارة الفئات</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
            {
              !isCashier && (
                    <TabsTrigger value="finance">المالية والمخزون</TabsTrigger>
                )
            }
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
                      {orders.map((order) => {

                        const originalPrice = order.products?.reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                        );

                        const discountPercent = order.usedPoints || 0;
                        const discountValue = originalPrice * (discountPercent / 100);

                        const finalPrice = order.price; // after discount
                        const deliveryPrice = order.deliveryPrice || 0;

                        const totalToPay = finalPrice + deliveryPrice;

                        return (
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
                                    $${
                                          order.status === "ordered"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : order.status === "shipped"
                                                  ? "bg-blue-100 text-blue-700"
                                                  : order.status === "delivered"
                                                      ? "bg-green-100 text-green-700"
                                                      : "bg-red-100 text-red-700"
                                      }`}
                                  >
                                  {order.status === "retrieved" ? "retrieved" : order.status}
                                </span>

                                  <span className="text-sm text-gray-500">
                                  {new Date(order.createdAt).toLocaleString()}
                                </span>
                                </div>
                              </div>

                              {/* Order Info */}
                              <p><strong>الهاتف :</strong> {order.phoneNumber}</p>
                              <p><strong>المنطقة :</strong> {order.region} - {order.city}</p>
                              <p>
                                <strong>السعر الأصلي :</strong>{" "}
                                <span className={order.usedPoints > 0 ? "line-through text-gray-400" : ""}>
                                  {originalPrice?.toFixed(2)}₪
                                </span>
                              </p>

                              {order.usedPoints > 0 && (
                                  <p className="text-green-600">
                                    <strong>الخصم ({order.usedPoints}%):</strong> -{discountValue.toFixed(2)}₪
                                  </p>
                              )}

                              <p>
                                <strong>السعر بعد الخصم :</strong> {finalPrice?.toFixed(2)}₪
                              </p>

                              <p>
                                <strong>سعر التوصيل :</strong> {deliveryPrice?.toFixed(2)}₪
                              </p>

                              <p className="font-semibold text-gray-900">
                                <strong>الإجمالي للدفع :</strong> {totalToPay?.toFixed(2)}₪
                              </p>
                              <p><strong>المصدر :</strong> {order.source}₪</p>

                              {order.notes && (
                                  <p><strong>ملاحظات :</strong> {order.notes}</p>
                              )}

                              {/* Products */}
                              <p className="mt-2"><strong>المنتجات :</strong></p>
                              <ul className="list-disc pl-5">
                                {order?.products?.map((p, i) => (
                                    <li key={i}>
                                      PID: {p.productId} - Amount: {p.quantity} - source: {p.source === "sourced" ? "out store" : p.source === "inStore" ? "in store": null}
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
                                <div className={'flex gap-3'}>
                                  {/* Delete Button */}
                                  <button onClick={() => handleDelete(order._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition">
                                    حذف الطلب
                                  </button>
                                  <button onClick={() => handleRetrieveOrder(order._id)} disabled={order.status === "retrieved"} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition disabled:opacity-50">
                                    {order.status === "retrieved" ? "تم الاسترجاع" : "استرجاع الطلب"}
                                  </button>
                                </div>
                              </div>
                            </div>
                        )
                      })}
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
                                <TableCell>
                                  {user.dob ? new Date(user.dob).toLocaleDateString("ar-EG") : "-"}
                                </TableCell>
                                <TableCell>{user.orderHistory.length || 0}</TableCell>

                                <TableCell>
                                  <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                    Active
                                  </span>
                                </TableCell>

                                <TableCell className="text-right">
                                  <Button variant="outline" size="sm" onClick={() => resetPassword(user._id)}>
                                    Reset Password
                                  </Button>

                                  <Button variant="destructive" size="sm" className="ml-2" onClick={() => deleteUser(user._id)}>
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
                                <TableCell>
                                  {user.dob ? new Date(user.dob).toLocaleDateString("ar-EG") : "-"}
                                </TableCell>
                                <TableCell>{user.orderHistory.length || 0}</TableCell>
                                <TableCell>
                                  <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                    Active
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">

                                  <Button variant="outline" size="sm" onClick={() => handleEditWholesaler(user)}>
                                    Edit
                                  </Button>

                                  <Button variant="outline" size="sm" className="ml-2" onClick={() => resetPassword(user._id)}>
                                    Reset Password
                                  </Button>

                                  <Button variant="destructive" size="sm" className="ml-2" onClick={() => deleteUser(user._id)}>
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

          <TabsContent value="finance" className="space-y-6">
            {financeLoading ? (
                <p>جاري تحميل البيانات...</p>
            ) : financeError ? (
                <p className="text-red-500">{financeError}</p>
            ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => setShowManualRevenueDialog(true)}>
                        إضافة إيراد يدوي
                      </Button>

                      <Button variant="outline" onClick={() => setShowExpenseDialog(true)}>
                        إضافة مصروف
                      </Button>

                      <Button variant="secondary" onClick={() => setShowOpeningBalanceDialog(true)}>
                        إضافة رصيد افتتاحي
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label htmlFor="year">السنة</Label>
                      <Input
                          id="year"
                          type="number"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(Number(e.target.value))}
                          className="w-32"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                    <FinanceCard title="الرصيد الحالي" value={financeSummary?.currentBalance}/>
                    <FinanceCard title="المصروفات" value={financeSummary?.totalExpenses}/>
                    <FinanceCard title="إيرادات التوصيل" value={financeSummary?.totalDeliveryRevenue}/>
                    <FinanceCard title="إيرادات الطلبات" value={financeSummary?.ordersRevenue}/>
                    <FinanceCard title="إيرادات يدوية" value={financeSummary?.manualRevenue}/>
                    <FinanceCard title="مرتجعات الطلبات" value={financeSummary?.totalOrderReturns} />
                    <FinanceCard title="إجمالي الإيرادات" value={financeSummary?.totalRevenue}/>
                    <FinanceCard title="تكلفة البضاعة" value={financeSummary?.totalCOGS}/>
                    <FinanceCard title="المبيعات الصفرية" value={financeSummary?.totalLosses}/>
                    <FinanceCard title="صافي الربح" value={financeSummary?.netProfit}/>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>آخر المصاريف</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {lastExpenses.length === 0 ? (
                          <p className="text-sm text-gray-500">لا توجد مصاريف</p>
                      ) : (
                          <div className="space-y-3 max-h-[70vh] overflow-auto">
                            {lastExpenses.map((expense) => (
                                <div key={expense._id} className="flex flex-col md:flex-row md:items-center md:justify-between border rounded-lg p-3 gap-3">
                                  <div>
                                    <p className="font-medium">مصروف</p>
                                    <p className="text-sm text-gray-500">
                                      {expense.description || "-"}
                                    </p>

                                    {expense.category && (
                                        <p className="text-xs text-gray-400 mt-1">
                                          التصنيف: {expense.category}
                                        </p>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between md:justify-end gap-4">
                                    <div className="text-left">
                                      <p className="font-bold">{Math.abs(expense.amount)} ₪</p>
                                      <p className="text-xs text-gray-400">
                                        {new Date(expense.createdAt).toLocaleString("ar-EG")}
                                      </p>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteExpense(expense._id)}
                                        disabled={deletingExpenseId === expense._id}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                                    >
                                      {deletingExpenseId === expense._id ? "..." : <Trash2 size={18} />}
                                    </button>
                                  </div>
                                </div>
                            ))}
                          </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>آخر الإيرادات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {mergedRecentRevenues.length === 0 ? (
                          <p className="text-sm text-gray-500">لا توجد إيرادات</p>
                      ) : (
                          <div className="space-y-4 max-h-[90vh] overflow-auto">
                            {mergedRecentRevenues.map((item) =>
                                item.kind === "order" ? (
                                    <div key={`order-${item._id}`} className={`border rounded-lg p-4 space-y-3 ${
                                      item.status === "retrieved" ? "bg-red-50 border-red-200" : ""
                                    }`}>
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-semibold">
                                            طلب {item.orderNumber ? `#${item.orderNumber}` : ""}
                                          </p>
                                          <p className="text-sm text-gray-500">
                                            {item.orderType || "-"}
                                          </p>

                                          {item.status === "retrieved" && (
                                              <p className="text-xs text-red-500 mt-1">
                                                طلب مرتجع
                                              </p>
                                          )}
                                        </div>

                                        <div className="text-left">
                                          <p className={`font-bold ${item.status === "retrieved" ? "text-red-500" : ""}`}>
                                            {item.status === "retrieved" ? `-${item.totalRevenue ?? 0}` : item.totalRevenue ?? 0} ₪
                                          </p>
                                          <p className="text-xs text-gray-400">
                                            {item.status === "retrieved" ? "إيراد ملغي بسبب الاسترجاع" : "إجمالي الإيراد"}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                        <div className="border rounded p-2">
                                          <p className="text-gray-500">سعر البيع</p>
                                          <p className="font-medium">{item.productRevenue ?? 0} ₪</p>
                                        </div>

                                        <div className="border rounded p-2">
                                          <p className="text-gray-500">تكلفة البضاعة</p>
                                          <p className="font-medium">{item.cogs ?? 0} ₪</p>
                                        </div>

                                        <div className="border rounded p-2">
                                          <p className="text-gray-500">ربح المنتج</p>
                                          <p className="font-medium">{item.productProfit ?? 0} ₪</p>
                                        </div>

                                        <div className="border rounded p-2">
                                          <p className="text-gray-500">سعر التوصيل</p>
                                          <p className="font-medium">{item.deliveryPrice ?? 0} ₪</p>
                                        </div>

                                        <div className="border rounded p-2">
                                          <p className="text-gray-500">ربح التوصيل</p>
                                          <p className="font-medium">{item.deliveryRevenue ?? 0} ₪</p>
                                        </div>

                                        <div className="border rounded p-2">
                                          <p className="text-gray-500">الإجمالي</p>
                                          <p className="font-bold">{item.totalRevenue ?? 0} ₪</p>
                                        </div>
                                      </div>

                                      <p className="text-xs text-gray-400">
                                        {new Date(item.createdAt).toLocaleString("ar-EG")}
                                      </p>
                                    </div>
                                ) : (
                                    <div
                                        key={`manual-${item._id}`}
                                        className="border rounded-lg p-4 bg-gray-50 space-y-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-semibold">إيراد يدوي</p>
                                          <p className="text-sm text-gray-500">
                                            {item.description || "-"}
                                          </p>

                                          {item.category && (
                                              <p className="text-xs text-gray-400 mt-1">
                                                التصنيف: {item.category}
                                              </p>
                                          )}
                                        </div>

                                        <div className="text-left">
                                          <p className="font-bold">{item.amount ?? 0} ₪</p>
                                          <p className="text-xs text-gray-400">
                                            {new Date(item.createdAt).toLocaleString("ar-EG")}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                )
                            )}
                          </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>التقرير الشهري</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {monthlyReport.length === 0 ? (
                          <p className="text-sm text-gray-500">لا توجد بيانات للشهور</p>
                      ) : (
                          <div className="space-y-3">
                            {monthlyReport.map((month, index) => (
                                <div key={index} className="grid grid-cols-2 md:grid-cols-10 gap-3 border rounded-lg p-3">
                                  <div>
                                    <p className="text-sm text-gray-500">شهر</p>
                                    <p className="font-medium">{month.month}</p>
                                  </div>

                                  <div>
                                    <p className="text-sm text-gray-500">إيراد البيع</p>
                                    <p className="font-medium">{month.revenue ?? 0} ₪</p>
                                  </div>

                                  <div>
                                    <p className="text-sm text-gray-500">إيراد التوصيل</p>
                                    <p className="font-medium">
                                      {month.deliveryRevenue ?? 0} ₪
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-sm text-gray-500">إيراد يدوي</p>
                                    <p className="font-medium">{month.manualRevenue ?? 0} ₪</p>
                                  </div>

                                  <div>
                                    <p className="text-sm text-gray-500">صافي تكلفة البضاعة</p>
                                    <p className="font-medium">{month.netCogs ?? 0} ₪</p>
                                  </div>

                                  <div>
                                    <p className="text-sm text-gray-500">المصاريف</p>
                                    <p className="font-medium">{month.expenses ?? 0} ₪</p>
                                  </div>

                                  <div>
                                    <p className="text-sm text-gray-500">المرتجعات</p>
                                    <p className="font-medium text-red-500">{month.orderReturns ?? 0} ₪</p>
                                  </div>

                                  <div>
                                    <p className="text-sm text-gray-500">تكلفة مسترجعة</p>
                                    <p className="font-medium text-green-600">{month.returnedCogs ?? 0} ₪</p>
                                  </div>

                                  <div>
                                    <p className="text-sm text-gray-500">تكلفة المنتجات الصفرية</p>
                                    <p className="font-medium">{month.losses ?? 0} ₪</p>
                                  </div>

                                  <div>
                                    <p className="text-sm text-gray-500">الصافي</p>
                                    <p className="font-bold">{month.net ?? 0} ₪</p>
                                  </div>
                                </div>
                            ))}
                          </div>
                      )}
                    </CardContent>
                  </Card>
                </>
            )}

            {/* Manual Revenue Dialog */}
            <Dialog open={showManualRevenueDialog} onOpenChange={setShowManualRevenueDialog}>
              <DialogContent>
                <DialogHeader style={{textAlign:'start'}}>
                  <DialogTitle>إضافة إيراد يدوي</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label>المبلغ</Label>
                    <Input type="number" value={manualRevenueAmount}
                        onChange={(e) =>
                            setManualRevenueAmount(
                                e.target.value === "" ? "" : Number(e.target.value)
                            )
                        }
                        placeholder="أدخل المبلغ"
                    />
                  </div>

                  <div>
                    <Label>الوصف</Label>
                    <Input
                        value={manualRevenueDescription}
                        onChange={(e) => setManualRevenueDescription(e.target.value)}
                        placeholder="مثال: بيع مباشر / دخل إضافي"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                      onClick={() => {
                        if (!manualRevenueAmount || manualRevenueAmount <= 0) {
                          toast({
                            title: "خطأ",
                            description: "يرجى إدخال مبلغ صحيح",
                            variant: "destructive",
                          });
                          return;
                        }

                        handleAddManualTransaction({
                          type: "manualRevenue",
                          amount: Number(manualRevenueAmount),
                          description: manualRevenueDescription,
                        });
                      }}
                  >
                    حفظ
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Expense Dialog */}
            <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
              <DialogContent>
                <DialogHeader style={{textAlign:'start'}}>
                  <DialogTitle>إضافة مصروف</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label>المبلغ</Label>
                    <Input
                        type="number"
                        value={expenseAmount}
                        onChange={(e) =>
                            setExpenseAmount(
                                e.target.value === "" ? "" : Number(e.target.value)
                            )
                        }
                        placeholder="أدخل مبلغ المصروف"
                    />
                  </div>

                  <div>
                    <Label>الوصف</Label>
                    <Input
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription(e.target.value)}
                        placeholder="مثال: إيجار / كهرباء / مواصلات"
                    />
                  </div>

                  <div>
                    <Label>التصنيف</Label>
                    <Input
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        placeholder="other"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                      onClick={() => {
                        if (!expenseAmount || expenseAmount <= 0) {
                          toast({
                            title: "خطأ",
                            description: "يرجى إدخال مبلغ صحيح",
                            variant: "destructive",
                          });
                          return;
                        }

                        handleAddManualTransaction({
                          type: "expense",
                          amount: Number(expenseAmount),
                          description: expenseDescription,
                          category: expenseCategory,
                        });
                      }}
                  >
                    حفظ
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Opening Balance Dialog */}
            <Dialog open={showOpeningBalanceDialog} onOpenChange={setShowOpeningBalanceDialog}>
              <DialogContent>
                <DialogHeader style={{textAlign:'start'}}>
                  <DialogTitle>إضافة رصيد افتتاحي</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label>المبلغ</Label>
                    <Input
                        type="number"
                        value={openingBalanceAmount}
                        onChange={(e) =>
                            setOpeningBalanceAmount(
                                e.target.value === "" ? "" : Number(e.target.value)
                            )
                        }
                        placeholder="أدخل الرصيد الافتتاحي"
                    />
                  </div>

                  <div>
                    <Label>الوصف</Label>
                    <Input
                        value={openingBalanceDescription}
                        onChange={(e) => setOpeningBalanceDescription(e.target.value)}
                        placeholder="مثال: رصيد افتتاحي لأول مرة"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                      onClick={() => {
                        if (!openingBalanceAmount || openingBalanceAmount <= 0) {
                          toast({
                            title: "خطأ",
                            description: "يرجى إدخال مبلغ صحيح",
                            variant: "destructive",
                          });
                          return;
                        }

                        handleAddManualTransaction({
                          type: "openingBalance",
                          amount: Number(openingBalanceAmount),
                          description: openingBalanceDescription,
                        });
                      }}
                  >
                    حفظ
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
