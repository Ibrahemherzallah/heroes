// src/pages/Profile.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import {
    User as UserIcon,
    LogOut,
    Settings,
    Package,
    Star,
} from "lucide-react";

interface User {
    id: string;
    phone: string;
    userName: string;
    isAdmin?: boolean;
    dob?: string;
}

type OrderStatus = "ordered" | "shipped" | "delivered";

interface Order {
    _id: string;
    createdAt: string;
    status: OrderStatus;
    shippedAt?: string;
    totalPrice: number;
    numOfItems: number;
}

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    // personal info form
    const [nameInput, setNameInput] = useState("");
    const [dobInput, setDobInput] = useState("");
    const [phone, setPhone] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    // orders
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState<string | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!raw || !token) {
            navigate("/login");
            return;
        }

        try {
            const parsed: User = JSON.parse(raw);
            setUser(parsed);
            setNameInput(parsed.userName || "");
            setPhone(parsed.phone)
            if (parsed.dob) {
                const d = new Date(parsed.dob);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                setDobInput(`${yyyy}-${mm}-${dd}`);
            }
        } catch {
            navigate("/login");
        }
    }, [navigate]);

    // fetch orders once user is set
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                setOrdersLoading(true);
                setOrdersError(null);


                const res = await fetch(`${import.meta.env.VITE_ENV}/api/order/my-orders`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "فشل في تحميل الطلبات");
                }

                setOrders(data.orders || data || []);
            } catch (err: any) {
                console.error("Fetch orders error:", err);
                setOrdersError(err.message || "حدث خطأ أثناء تحميل الطلبات");
            } finally {
                setOrdersLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setSavingProfile(true);

            const res = await fetch(`${import.meta.env.VITE_ENV}/api/auth/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userName: nameInput,
                    phone,
                    dob: dobInput || null,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "فشل تحديث البيانات");
            }

            const updatedUser: User = {
                ...user,
                userName: data.user?.userName ?? nameInput,
                phone: data.user?.phone ?? phone,
                dob: data.user?.dob ?? dobInput,
            };

            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            // يمكنك إضافة toast هنا إن أردت
        } catch (err) {
            console.error("Update profile error:", err);
        } finally {
            setSavingProfile(false);
        }
    };

    // logical status: delivered 5 days after shipped
    const getDisplayStatus = (order: Order): OrderStatus => {
        if (order.status === "shipped" && order.shippedAt) {
            const shippedDate = new Date(order.shippedAt).getTime();
            const diffDays = (Date.now() - shippedDate) / (1000 * 60 * 60 * 24);
            if (diffDays >= 5) return "delivered";
        }
        return order.status;
    };

    // points: 1 point / 100 ILS for shipped & delivered orders
    const points = useMemo(() => {
        if (!orders.length) return 0;
        const eligible = orders.filter((o) => {
            const st = getDisplayStatus(o);
            return st === "shipped" || st === "delivered";
        });
        const total = eligible.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        return Math.floor(total / 100);
    }, [orders]);

    const currentDiscount = useMemo(() => {
        if (points >= 30) return 30;
        if (points >= 25) return 25;
        if (points >= 20) return 20;
        return 0;
    }, [points]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#f6f2ea] flex flex-col">
            {/* Main site navbar / header */}
            <Header />

            {/* Account header + tabs */}
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-8 py-8">
                {/* top row: title + logout */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            حسابي
                        </h1>
                        <p className="text-sm text-gray-600">
                            مرحباً، <span className="font-semibold">{user.userName}</span>
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        className="flex items-center gap-2 bg-white/60 hover:bg-white"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" />
                        تسجيل الخروج
                    </Button>
                </div>

                {/* tabs bar */}
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="w-full bg-transparent justify-start gap-2 mb-6">
                        <TabsTrigger value="points" className="px-5 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            نقاط الولاء
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="px-5 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            طلباتي
                        </TabsTrigger>
                        <TabsTrigger value="info" className="px-5 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            البيانات الشخصية
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB: Personal info */}
                    <TabsContent value="info">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* left card: summary */}
                            <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col justify-between">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-amber-700" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-lg">
                                            البيانات الشخصية
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                             مرحباً, {user.userName}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-gray-700">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">نوع الحساب</span>
                                        <span>{user.role === 'user' ? "زبون" : "تاجر"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">الرقم</span>
                                        <span className="truncate max-w-[60%] text-right">
                                          {user.phone}
                                        </span>
                                    </div>
                                    {user.dob && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Date of birth</span>
                                            <span>
                                                {new Date(user.dob).toLocaleDateString("ar-EG")}
                                              </span>
                                        </div>
                                    )}
                                </div>

                                {user.isAdmin && (
                                    <div className="mt-6">
                                        <Button
                                            variant="outline"
                                            className="w-full flex items-center justify-center gap-2"
                                            onClick={() => navigate("/admin/dashboard")}
                                        >
                                            <Settings className="w-4 h-4" />
                                            Go to admin dashboard
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* right card: editable form */}
                            <div className="bg-white rounded-3xl shadow-sm p-6">
                                <h2 className="font-semibold text-lg mb-4">تعديل المعلومات الشخصية</h2>
                                <form className="space-y-4" onSubmit={handleSaveProfile}>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            اسم المستخدم
                                        </label>
                                        <Input
                                            value={nameInput}
                                            onChange={(e) => setNameInput(e.target.value)}
                                            className="bg-[#f8f4ec]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            الهاتف
                                        </label>
                                        <Input
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="bg-[#f8f4ec]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            تاريخ الميلاد
                                        </label>
                                        <Input
                                            type="date"
                                            value={dobInput}
                                            onChange={(e) => setDobInput(e.target.value)}
                                            className="bg-[#f8f4ec]"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="mt-2 w-full bg-[#7a4a23] hover:bg-[#6a3e1a]"
                                        disabled={savingProfile}
                                    >
                                        {savingProfile ? "جار الحفظ ..." : "احفظ التغييرات"}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB: Orders */}
                    <TabsContent value="orders">
                        <div className="bg-white rounded-3xl shadow-sm p-6">
                            <h2 className="font-semibold text-lg mb-4">طلباتي</h2>

                            {ordersLoading && (
                                <p className="text-sm text-gray-600">تحميل الطلبات ....</p>
                            )}
                            {ordersError && (
                                <p className="text-sm text-red-500"> خلل في تحميل الطلبات </p>
                            )}
                            {!ordersLoading && !ordersError && orders.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    لا يوجد لديك طلبات بعد.
                                </p>
                            )}

                            {!ordersLoading && !ordersError && orders.length > 0 && (
                                <div className="space-y-4">
                                    {orders.map((order) => {
                                        const status = getDisplayStatus(order);

                                        const statusLabel =
                                            status === "ordered"
                                                ? "Ordered"
                                                : status === "shipped"
                                                    ? "Shipped"
                                                    : "Delivered";

                                        const statusColor =
                                            status === "ordered"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : status === "shipped"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-green-100 text-green-700";

                                        // حساب إجمالي السعر إذا ما كان موجود
                                        const calculatedTotal = order.products?.reduce((acc, item) => {
                                            const price = item.productId?.customerPrice || 0;
                                            return acc + price * item.quantity;
                                        }, 0);

                                        return (
                                            <div key={order._id} className="border border-gray-100 rounded-2xl p-4">
                                                {/* ===== Header ===== */}
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Package className="w-4 h-4 text-gray-500" />
                                                            <span className="text-sm font-semibold">
                                                              Order #{order._id.slice(-6)}
                                                            </span>
                                                        </div>

                                                        <p className="text-xs text-gray-500">
                                                            Date:{" "}
                                                            {new Date(order.createdAt).toLocaleString("ar-EG")}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            Total:{" "}{(order.price || calculatedTotal)?.toFixed(2)} ₪
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col items-start md:items-end gap-2">
                                                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                                                            {statusLabel}
                                                          </span>

                                                        {order.status === "shipped" &&
                                                            status === "shipped" && (
                                                                <p className="text-[11px] text-gray-500">
                                                                    سيصل المنتج خلال 5 أيام كحد أقصى في معظم الحالات.
                                                                </p>
                                                            )}
                                                    </div>
                                                </div>

                                                {/* ===== Products List ===== */}
                                                <div className="space-y-3">
                                                    {order.products?.map((item, index) => (
                                                        <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                                                            {/* معلومات المنتج */}
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">
                                                                    {item.name}
                                                                </p>

                                                                <p className="text-xs text-gray-500">
                                                                    Quantity: {item.quantity}
                                                                </p>

                                                                <p className="text-xs text-gray-500">
                                                                    Price:{" "}
                                                                    {item.price?.toFixed(2)} ₪
                                                                </p>
                                                            </div>

                                                            {/* إجمالي المنتج */}
                                                            <div className="text-sm font-semibold">
                                                                {(
                                                                    (item.price || 0) *
                                                                    item.quantity
                                                                ).toFixed(2)} ₪
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* TAB: Loyalty points */}
                    <TabsContent value="points">
                        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                    <Star className="w-5 h-5 text-amber-700" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-lg">نقاط الولاء</h2>
                                    <p className="text-sm text-gray-600">
                                        تحصل على نقطة واحدة مقابل كل 100₪ من مشترياتك المؤهلة.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#f8f4ec] rounded-2xl p-4 space-y-2">
                                <p className="text-sm">
                                    <span className="font-semibold">النقاط الحالية:</span>{" "}
                                    <span className="text-[#7a4a23] font-bold">{points}</span>
                                </p>
                                <p className="text-sm">
                                    <span className="font-semibold">الخصم المتاح:</span>{" "}
                                    {currentDiscount > 0 ? (
                                        <span className="text-[#7a4a23] font-bold">
                                      {currentDiscount}%
                                    </span>
                                                    ) : (
                                                        <span className="text-gray-600">
                                      لا يوجد خصم متاح حالياً، استمر في الشراء لتحصيل المزيد من
                                      النقاط 🎁
                                    </span>
                                    )}
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-3">
                                <div className="border border-gray-100 rounded-2xl p-3">
                                    <p className="text-sm font-semibold mb-1">20 نقطة</p>
                                    <p className="text-xs text-gray-600">
                                        احصل على خصم <span className="font-bold">20%</span> على
                                        طلبك.
                                    </p>
                                </div>
                                <div className="border border-gray-100 rounded-2xl p-3">
                                    <p className="text-sm font-semibold mb-1">25 نقطة</p>
                                    <p className="text-xs text-gray-600">
                                        احصل على خصم <span className="font-bold">25%</span> على
                                        طلبك.
                                    </p>
                                </div>
                                <div className="border border-gray-100 rounded-2xl p-3">
                                    <p className="text-sm font-semibold mb-1">30 نقطة</p>
                                    <p className="text-xs text-gray-600">
                                        احصل على خصم <span className="font-bold">30%</span> على
                                        طلبك.
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500">
                                * يتم احتساب النقاط بناءً على قيمة الطلبات التي تم شحنها أو
                                تسليمها. يمكن تعديل منطق الاحتساب من جهة الخادم حسب سياسة
                                النظام.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 text-center text-xs text-gray-500">
                    <Link to="/" className="text-[#7a4a23] underline">
                        العودة للصفحة الرئيسية
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Profile;