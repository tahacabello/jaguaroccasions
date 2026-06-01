"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BarChart3, ShoppingCart, Package, Users, TrendingUp, Search, Eye, Edit3, Trash2, Plus, Check, RefreshCw, Lock, ArrowRight } from "lucide-react";
import Image from "next/image";
import { 
  getSupabaseProducts, 
  addSupabaseProduct, 
  updateSupabaseProduct, 
  deleteSupabaseProduct, 
  getSupabaseSettings, 
  updateSupabaseSetting 
} from "@/lib/supabase";

// Mock products state for inventory management
const initialProducts = [
  { id: "1", name: "كاب كويتي فاخر", priceSale: 85, priceRent: 40, category: "كابات التخرج", status: "متوفر", sales: 24, image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=200&auto=format&fit=crop" },
  { id: "2", name: "شال تخرج مطرز", priceSale: 45, priceRent: 20, category: "شالات التخرج", status: "متوفر", sales: 42, image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=200&auto=format&fit=crop" },
  { id: "3", name: "بروش مخصص", priceSale: 25, priceRent: 12, category: "بروشات التخرج", status: "محجوز", sales: 18, image: "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?q=80&w=200&auto=format&fit=crop" },
  { id: "4", name: "روب تخرج أطفال", priceSale: 60, priceRent: 30, category: "كابات التخرج", status: "متوفر", sales: 15, image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=200&auto=format&fit=crop" },
];

// Mock orders state for order management
const initialOrders = [
  { id: "JG-849302", customer: "أحمد عبد الله الوداني", city: "طرابلس", date: "2026-05-30", total: 95, payment: "الدفع عند الاستلام", status: "pending" },
  { id: "JG-102948", customer: "محمد طارق الفرجاني", city: "بنغازي", date: "2026-05-29", total: 145, payment: "موبي كاش", status: "processing" },
  { id: "JG-749283", customer: "سارة عبد الحميد البكوش", city: "مصراتة", date: "2026-05-28", total: 60, payment: "خدمة سداد", status: "delivered" },
  { id: "JG-582910", customer: "عمر سالم الترهوني", city: "الخمس", date: "2026-05-27", total: 120, payment: "الدفع عند الاستلام", status: "cancelled" },
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [authError, setAuthError] = useState("");
  
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "inventory" | "settings">("analytics");
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(true);

  // Settings state
  const [settings, setSettings] = useState<Record<string, string>>({
    contact_phone: "+218 92 123 4567",
    contact_email: "info@jaguar.ly",
    location: "ليبيا - طرابلس، شارع النصر",
    announcement_text: "توصيل لجميع أنحاء ليبيا 🎓",
    hero_title: "لحظة تخرجك، بأرقى المعايير",
    hero_subtitle: "اكتشف مجموعتنا الحصرية من كابات التخرج، القبعات، والشالات الفاخرة. بيع وإيجار مع خدمة توصيل لجميع أنحاء ليبيا."
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check auth session on mount
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("jaguar_admin_auth");
    if (sessionAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch Supabase products and settings
  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    
    Promise.all([
      getSupabaseProducts(),
      getSupabaseSettings()
    ]).then(([dbProducts, dbSettings]) => {
      setProducts(dbProducts);
      setSettings(dbSettings);
      setIsLoading(false);
    }).catch(err => {
      console.error("Error fetching data from Supabase in admin dashboard:", err);
      setIsLoading(false);
    });
  }, [isAuthenticated]);

  // Load simulated checkout orders from localStorage
  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      const keys = Object.keys(localStorage);
      const simulatedOrders = keys
        .filter((key) => key.startsWith("simulated_order_"))
        .map((key) => {
          const ord = JSON.parse(localStorage.getItem(key) || "{}");
          return {
            id: ord.tracking_number || `JG-${ord.id.substring(0, 6)}`,
            customer: ord.guest_name,
            city: ord.guest_city,
            date: new Date(ord.created_at).toISOString().split("T")[0],
            total: ord.total_amount,
            payment: ord.payment_method === "cash_on_delivery" ? "الدفع عند الاستلام" : ord.payment_method === "sadad" ? "خدمة سداد" : "موبي كاش",
            status: ord.status || "pending",
          };
        });

      if (simulatedOrders.length > 0) {
        setOrders((prev) => {
          const filteredPrev = prev.filter(p => !simulatedOrders.some(s => s.id === p.id));
          return [...simulatedOrders, ...filteredPrev];
        });
      }
    } catch (e) {
      console.error("Error loading simulated orders in Admin panel:", e);
    }
  }, [isAuthenticated]);

  // Inventory forms state
  const [newProductName, setNewProductName] = useState("");
  const [newProductPriceSale, setNewProductPriceSale] = useState("");
  const [newProductPriceRent, setNewProductPriceRent] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("كابات التخرج");
  const [showAddForm, setShowAddForm] = useState(false);

  // Authenticate Admin
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Customized admin password
    if (accessCode === "9999") {
      setIsAuthenticated(true);
      sessionStorage.setItem("jaguar_admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("رمز التحقق غير صحيح، يرجى المحاولة مجدداً.");
    }
  };

  // Logout admin
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("jaguar_admin_auth");
  };

  // Handle order status update
  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // Handle adding new product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPriceSale || !newProductPriceRent) return;

    const nextId = (products.length + 1).toString();
    const newProd = {
      id: nextId,
      name: newProductName,
      priceSale: parseFloat(newProductPriceSale),
      priceRent: parseFloat(newProductPriceRent),
      category: newProductCategory,
      categoryId: newProductCategory === "كابات التخرج" ? "gowns" : 
                  newProductCategory === "قبعات التخرج" ? "caps" : 
                  newProductCategory === "شالات التخرج" ? "sashes" : "pins",
      status: "متوفر",
      sales: 0,
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop",
      code: `JG-00${nextId}`
    };

    const success = await addSupabaseProduct(newProd);
    if (success) {
      setProducts([newProd, ...products]);
      setNewProductName("");
      setNewProductPriceSale("");
      setNewProductPriceRent("");
      setShowAddForm(false);
    }
  };

  // Toggle product availability status
  const handleToggleProductStatus = async (productId: string) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    
    const nextStatus = p.status === "متوفر" ? "محجوز" : p.status === "محجوز" ? "غير متوفر" : "متوفر";
    const success = await updateSupabaseProduct(productId, { status: nextStatus });
    if (success) {
      setProducts((prev) =>
        prev.map((prod) => prod.id === productId ? { ...prod, status: nextStatus } : prod)
      );
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    const success = await deleteSupabaseProduct(id);
    if (success) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  // Save Site settings to Supabase
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSaveSuccess(false);

    try {
      const promises = Object.entries(settings).map(([key, val]) => 
        updateSupabaseSetting(key, val)
      );
      await Promise.all(promises);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving settings to Supabase:", err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Summary Metrics calculations
  const totalRevenue = orders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingCount = orders.filter(o => o.status === "pending").length;

  // Render Login Lock Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center pt-12 pb-24 text-right">
          <div className="container mx-auto px-4 max-w-md">
            <div className="glass p-8 rounded-3xl border border-border shadow-2xl space-y-6">
              
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary-light rounded-full border border-primary/20 mb-2">
                  <Lock className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
                  الدخول الآمن للإدارة
                </h1>
                <p className="text-foreground/50 text-xs">
                  هذه الصفحة محمية. يرجى إدخال رمز التحقق الخاص بمتجر جاغوار.
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground/75">رمز التحقق للإدارة *</label>
                  <input
                    type="password"
                    required
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="أدخل الرمز السري للأدمن"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-bold text-center tracking-widest"
                  />
                </div>

                {authError && (
                  <p className="text-xs text-red-400 font-bold text-center mt-2">{authError}</p>
                )}

                <button
                  type="submit"
                  className="w-full btn-premium py-3.5 font-black text-sm flex items-center justify-center gap-2 mt-4"
                >
                  تأكيد الدخول
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </form>

            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Render Dashboard if authenticated
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-12 pb-24 text-right animate-fadeIn">
        <div className="container mx-auto px-4 lg:px-8">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-border pb-8">
            <div>
              <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
                لوحة تحكم الإدارة الفاخرة
              </h1>
              <p className="text-foreground/60 text-sm">إدارة مبيعات، إيجارات ومخزون متجر جاغوار</p>
            </div>
            
            {/* Quick action buttons */}
            <div className="flex gap-4 items-center">
              <button onClick={() => window.location.reload()} className="p-3 bg-surface hover:bg-surface-hover rounded-xl border border-border hover:border-primary/50 text-foreground transition-all duration-300">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setActiveTab("inventory");
                  setShowAddForm(true);
                }}
                className="btn-premium py-3 px-6 text-sm font-bold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة منتج جديد
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-3 rounded-xl border border-red-500/25 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold transition-all duration-300"
              >
                تسجيل الخروج الآمن
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border border-border bg-surface p-1.5 rounded-2xl max-w-2xl mb-10 overflow-x-auto gap-2">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === "analytics"
                  ? "bg-primary text-black"
                  : "text-foreground/60 hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              الإحصائيات والتحليلات
            </button>
            
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 relative whitespace-nowrap ${
                activeTab === "orders"
                  ? "bg-primary text-black"
                  : "text-foreground/60 hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              إدارة الطلبات
              {pendingCount > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === "inventory"
                  ? "bg-primary text-black"
                  : "text-foreground/60 hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <Package className="w-4 h-4" />
              إدارة المنتجات
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === "settings"
                  ? "bg-primary text-black"
                  : "text-foreground/60 hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <Edit3 className="w-4 h-4" />
              تعديل محتوى الموقع
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="min-h-[500px]">
            
            {/* ANALYTICS TAB */}
            {activeTab === "analytics" && (
              <div className="space-y-10 animate-fadeIn">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="glass p-6 rounded-3xl border border-border flex items-center gap-5">
                    <div className="p-4 bg-primary/10 text-primary-light rounded-2xl shrink-0">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-xs text-foreground/60 font-bold block mb-1">إجمالي المبيعات والنشاط</span>
                      <span className="text-2xl font-black text-primary-light">{totalRevenue} د.ل</span>
                    </div>
                  </div>

                  <div className="glass p-6 rounded-3xl border border-border flex items-center gap-5">
                    <div className="p-4 bg-primary/10 text-primary-light rounded-2xl shrink-0">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-xs text-foreground/60 font-bold block mb-1">عدد الطلبات الإجمالي</span>
                      <span className="text-2xl font-black text-primary-light">{orders.length} طلبات</span>
                    </div>
                  </div>

                  <div className="glass p-6 rounded-3xl border border-border flex items-center gap-5">
                    <div className="p-4 bg-primary/10 text-primary-light rounded-2xl shrink-0">
                      <RefreshCw className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-xs text-foreground/60 font-bold block mb-1">الطلبات المعلقة</span>
                      <span className="text-2xl font-black text-amber-400">{pendingCount} طلبات</span>
                    </div>
                  </div>

                  <div className="glass p-6 rounded-3xl border border-border flex items-center gap-5">
                    <div className="p-4 bg-primary/10 text-primary-light rounded-2xl shrink-0">
                      <Users className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-xs text-foreground/60 font-bold block mb-1">الزبائن الجدد</span>
                      <span className="text-2xl font-black text-primary-light">32 زبون</span>
                    </div>
                  </div>

                </div>

                {/* Additional Charts Mock */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Top selling products */}
                  <div className="glass p-6 rounded-3xl border border-border lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold">المنتجات الأكثر مبيعاً ونشاطاً</h3>
                    
                    <div className="space-y-4">
                      {products.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-border">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-background">
                              <Image src={p.image} alt={p.name} fill className="object-cover" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm">{p.name}</h4>
                              <span className="text-xs text-foreground/50">{p.category}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-8">
                            <div className="text-left">
                              <span className="text-xs text-foreground/50 block">المبيعات</span>
                              <span className="font-bold text-sm text-primary-light">{p.sales} قطعة</span>
                            </div>
                            <div className="text-left min-w-[70px]">
                              <span className="text-xs text-foreground/50 block">الإيرادات</span>
                              <span className="font-black text-sm text-white">{p.sales * p.priceSale} د.ل</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Quick system alert */}
                  <div className="glass p-6 rounded-3xl border border-border space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold mb-3">حالة الخادم وقاعدة البيانات</h3>
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold mb-4">
                        <Check className="w-4 h-4" />
                        نظام Supabase يعمل بشكل ممتاز
                      </div>
                      
                      <p className="text-sm text-foreground/60 leading-relaxed">
                        جميع مبيعات وإيجارات خريجي ليبيا مسجلة ومؤمنة بالكامل عن طريق سياسات أمان PostgreSQL RLS. لوحة تحكم الإدارة تتيح لك مراقبة وتعديل الطلبات فورياً.
                      </p>
                    </div>

                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 text-xs text-primary-light/95 leading-relaxed">
                      💡 **تنبيه:** يمكنك مراجعة طلبات عملائك من صفحة إتمام الطلبات وتحويل حالتها إلى "خارج للتوصيل" للبدء في شحنها.
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="glass p-6 rounded-3xl border border-border animate-fadeIn space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-4 mb-4">
                  <h3 className="text-xl font-bold">جدول إدارة الطلبات</h3>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface border border-border text-foreground/60">
                    عدد الطلبات المسجلة: {orders.length}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-border text-foreground/60 font-bold text-sm">
                        <th className="py-4 px-4">رقم الطلب</th>
                        <th className="py-4 px-4">اسم العميل (الضيف)</th>
                        <th className="py-4 px-4">المدينة</th>
                        <th className="py-4 px-4">تاريخ الطلب</th>
                        <th className="py-4 px-4">المجموع الإجمالي</th>
                        <th className="py-4 px-4">طريقة الدفع</th>
                        <th className="py-4 px-4">حالة الشحنة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-semibold text-sm">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-surface-hover/30 transition-colors">
                          <td className="py-4 px-4 font-black text-primary-light">{order.id}</td>
                          <td className="py-4 px-4">{order.customer}</td>
                          <td className="py-4 px-4">{order.city}</td>
                          <td className="py-4 px-4 text-xs font-mono">{order.date}</td>
                          <td className="py-4 px-4 text-primary-light font-black">{order.total} د.ل</td>
                          <td className="py-4 px-4 text-xs text-foreground/70">{order.payment}</td>
                          <td className="py-4 px-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs border focus:outline-none focus:border-primary ${
                                order.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                order.status === "processing" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                order.status === "delivered" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}
                            >
                              <option value="pending" className="bg-surface text-foreground">معلق (Pending)</option>
                              <option value="processing" className="bg-surface text-foreground">قيد التجهيز</option>
                              <option value="delivered" className="bg-surface text-foreground">تم التسليم</option>
                              <option value="cancelled" className="bg-surface text-foreground">ملغي</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === "inventory" && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Form to add a new product */}
                {showAddForm && (
                  <form onSubmit={handleAddProduct} className="glass p-6 rounded-3xl border border-primary/20 bg-primary/5 space-y-6">
                    <h3 className="text-lg font-bold border-b border-border pb-3">إدخال مستلزم تخرج جديد</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/60">اسم المنتج</label>
                        <input
                          type="text"
                          required
                          value={newProductName}
                          onChange={(e) => setNewProductName(e.target.value)}
                          placeholder="مثال: شال ملكي مطرز"
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/60">سعر البيع النهائي (د.ل)</label>
                        <input
                          type="number"
                          required
                          value={newProductPriceSale}
                          onChange={(e) => setNewProductPriceSale(e.target.value)}
                          placeholder="مثال: 95"
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/60">سعر الإيجار للمناسبة (د.ل)</label>
                        <input
                          type="number"
                          required
                          value={newProductPriceRent}
                          onChange={(e) => setNewProductPriceRent(e.target.value)}
                          placeholder="مثال: 45"
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/60">قسم المنتجات</label>
                        <select
                          value={newProductCategory}
                          onChange={(e) => setNewProductCategory(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-bold"
                        >
                          <option value="كابات التخرج">كابات التخرج</option>
                          <option value="قبعات التخرج">قبعات التخرج</option>
                          <option value="شالات التخرج">شالات التخرج</option>
                          <option value="بروشات التخرج">بروشات التخرج</option>
                        </select>
                      </div>

                      <div className="flex items-end gap-4">
                        <button type="submit" className="btn-premium flex-1 py-3 text-sm font-bold">
                          إضافة المنتج للمخزون
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-6 py-3 rounded-xl border border-border bg-surface hover:bg-surface-hover text-sm font-bold transition-all duration-300"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Inventory Table */}
                <div className="glass p-6 rounded-3xl border border-border">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">قائمة المخزون</h3>
                    {!showAddForm && (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 py-2 bg-surface hover:bg-primary hover:text-black border border-border hover:border-primary transition-all rounded-xl text-sm font-bold flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة منتج
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className="flex gap-4 p-4 rounded-2xl bg-surface border border-border hover:border-primary/20 transition-all duration-300 items-center justify-between"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-background shrink-0">
                            <Image src={p.image} alt={p.name} fill className="object-cover" />
                          </div>
                          <div>
                            <h4 className="font-bold text-base">{p.name}</h4>
                            <span className="text-xs text-foreground/50 block mb-1">{p.category}</span>
                            <div className="flex gap-4 text-xs font-semibold mt-1">
                              <span className="text-primary-light">بيع: {p.priceSale} د.ل</span>
                              <span className="text-primary-light/80">إيجار: {p.priceRent} د.ل</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 shrink-0">
                          {/* Toggle Status Button */}
                          <button
                            onClick={() => handleToggleProductStatus(p.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                              p.status === "متوفر" ? "bg-green-500/10 text-green-400" :
                              p.status === "محجوز" ? "bg-amber-500/10 text-amber-400" :
                              "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {p.status}
                          </button>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 hover:bg-red-500/10 text-foreground/40 hover:text-red-400 border border-transparent hover:border-red-500/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn text-right">
                
                {/* Left: Editor Form */}
                <form onSubmit={handleSaveSettings} className="glass p-8 rounded-3xl border border-border space-y-6">
                  <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
                    <h3 className="text-xl font-bold">تعديل نصوص وأرقام الموقع</h3>
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-6 py-2.5 bg-primary text-black rounded-xl font-bold text-sm hover:bg-primary-light transition-all flex items-center gap-2"
                    >
                      {isSavingSettings ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </button>
                  </div>

                  {saveSuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      تم حفظ التغييرات وتحديثها لدى جميع المستخدمين بنجاح!
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-primary-light border-r-2 border-primary pr-2">الشريط الإعلاني والواجهة</h4>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">نص الإعلان العلوي</label>
                      <input
                        type="text"
                        value={settings.announcement_text || ""}
                        onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">عنوان الواجهة الرئيسية (Hero Title)</label>
                      <input
                        type="text"
                        value={settings.hero_title || ""}
                        onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">الوصف المساعد في الواجهة</label>
                      <textarea
                        rows={3}
                        value={settings.hero_subtitle || ""}
                        onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-bold text-primary-light border-r-2 border-primary pr-2">معلومات التواصل والتذييل</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground/60">رقم الهاتف للتواصل</label>
                        <input
                          type="text"
                          value={settings.contact_phone || ""}
                          onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                          dir="ltr"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="block text-xs font-bold text-foreground/60">البريد الإلكتروني</label>
                        <input
                          type="email"
                          value={settings.contact_email || ""}
                          onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground/60">عنوان وموقع المحل (شارع النصر)</label>
                      <input
                        type="text"
                        value={settings.location || ""}
                        onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                  </div>
                </form>

                {/* Right: Live Visual Preview */}
                <div className="glass p-8 rounded-3xl border border-border space-y-6 flex flex-col">
                  <h3 className="text-xl font-bold border-b border-border pb-4">👁️ معاينة حية للموقع (المظهر عند المستخدمين)</h3>
                  
                  <div className="flex-1 flex flex-col justify-between border border-border rounded-2xl bg-background overflow-hidden min-h-[380px] shadow-2xl relative text-right">
                    
                    {/* Preview Announcement Bar */}
                    <div className="bg-primary/10 text-primary-light text-center py-1 text-[10px] font-bold border-b border-primary/20">
                      {settings.announcement_text}
                    </div>

                    {/* Preview Header Logo */}
                    <div className="p-3 border-b border-border bg-surface/50 flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground/50">JAGUAR Occasions</span>
                      <div className="flex gap-2">
                        <div className="w-5 h-5 rounded-full bg-border"></div>
                        <div className="w-5 h-5 rounded-full bg-border"></div>
                      </div>
                    </div>

                    {/* Preview Hero Content */}
                    <div className="p-6 text-center space-y-3 my-auto">
                      <h1 className="text-xl font-black text-white leading-tight">{settings.hero_title}</h1>
                      <p className="text-xs text-foreground/60 leading-relaxed max-w-sm mx-auto">{settings.hero_subtitle}</p>
                      <div className="inline-block px-4 py-1.5 bg-primary text-black rounded-lg text-[10px] font-bold shadow-md shadow-primary/20">
                        تصفح المتجر
                      </div>
                    </div>

                    {/* Preview Footer content */}
                    <div className="p-4 bg-surface border-t border-border text-[10px] text-foreground/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">تواصل معنا:</span>
                        <span>{settings.location}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>هاتف: {settings.contact_phone}</span>
                        <span>بريد: {settings.contact_email}</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
