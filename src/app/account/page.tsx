"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase, getSupabaseUserProfile, updateSupabaseUserProfile, resolveAssetPath } from "@/lib/supabase";
import { User, ShoppingBag, MapPin, Phone, LogOut, Package, RefreshCw, Calendar, CreditCard, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const statusTranslations: Record<string, string> = {
  new_order: "طلب جديد",
  waiting_confirmation: "بانتظار التأكيد",
  confirmed: "تم التأكيد",
  preparing: "قيد التجهيز",
  ready: "جاهز للتسليم",
  reserved: "محجوز",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const statusSteps = [
  { key: "new_order", label: "طلب جديد" },
  { key: "waiting_confirmation", label: "بانتظار التأكيد" },
  { key: "confirmed", label: "تم التأكيد" },
  { key: "preparing", label: "قيد التجهيز" },
  { key: "ready", label: "جاهز للتسليم" },
  { key: "reserved", label: "محجوز" },
  { key: "completed", label: "مكتمل" },
];

const cityNames: Record<string, string> = {
  tripoli: "طرابلس",
  benghazi: "بنغازي",
  misrata: "مصراتة",
  khoms: "الخمس",
  zawiya: "الزاوية",
  sebha: "سبها",
  garian: "غريان",
  tobruk: "طبرق",
  zleten: "زليتن",
  msallata: "مسلاتة",
  other: "مدينة أخرى",
};

export default function AccountPage() {
  const router = useRouter();
  
  // Auth & Profile state
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Edit fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [backupPhone, setBackupPhone] = useState("");
  const [city, setCity] = useState("tripoli");
  const [street, setStreet] = useState("");
  const [addressDetail, setAddressDetail] = useState("");

  // UI state
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);

      // Fetch Profile
      const prof = await getSupabaseUserProfile(user.id);
      if (prof) {
        setProfile(prof);
        setName(prof.name || "");
        setPhone(prof.phone || "");
        setBackupPhone(prof.backup_phone || "");
        const cityKey = Object.keys(cityNames).find(key => cityNames[key] === prof.city) || "tripoli";
        setCity(cityKey);
        setStreet(prof.street || "");
        setAddressDetail(prof.additional_address || "");
      }

      // Fetch Customer Orders
      const { data: dbOrders, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (dbOrders && !error) {
        setOrders(dbOrders);
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaveLoading(true);
    setSaveSuccess(false);

    try {
      const success = await updateSupabaseUserProfile(user.id, {
        name,
        phone,
        backup_phone: backupPhone,
        city: cityNames[city] || city,
        street,
        additional_address: addressDetail
      });

      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("فشل تحديث البيانات. يرجى المحاولة مرة أخرى.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("jaguar_admin_auth");
    router.push("/");
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Generate pre-filled WhatsApp verification message for any order
  const getWhatsAppLink = (order: any) => {
    const itemsList = order.order_items
      ? order.order_items.map((item: any) => `- ${item.product_name} (${item.item_mode === "rent" ? "إيجار" : "شراء"}) x${item.quantity}`).join("\n")
      : "";

    const message = `السلام عليكم، أود الاستفسار/التأكيد على طلبي رقم (${order.tracking_number}) المسجل بحسابي لدى جاغوار.
الاسم: ${order.guest_name}
الهاتف: ${order.guest_phone}
الحالة الحالية: ${statusTranslations[order.status] || order.status}

المنتجات المطلوبة:
${itemsList}
المجموع: ${order.total_amount} د.ل`;

    return `https://wa.me/218921234567?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-16 pb-24 text-right">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8 mb-12">
            <div>
              <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
                حسابك الفاخر
              </h1>
              <p className="text-foreground/60 text-sm mt-2">مرحباً بك، {profile?.name || "زبون جاغوار"}</p>
            </div>
            
            <button
              onClick={handleSignOut}
              className="px-6 py-3 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 font-bold text-sm flex items-center gap-2 transition-all self-start md:self-auto"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar navigation (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="glass rounded-2xl border border-border p-3 space-y-2">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
                    activeTab === "orders" ? "bg-primary text-black" : "hover:bg-surface-hover text-foreground/80"
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  طلبياتي وحجوزاتي
                  <span className="mr-auto bg-black/10 text-xs px-2 py-0.5 rounded-full font-black">
                    {orders.length}
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
                    activeTab === "profile" ? "bg-primary text-black" : "hover:bg-surface-hover text-foreground/80"
                  }`}
                >
                  <User className="w-5 h-5" />
                  تفاصيل ملفي الشخصي
                </button>
              </div>
              
              {/* Announcement badge */}
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2 text-primary-light">
                <h4 className="font-black text-sm flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  تأكيد الطلبات
                </h4>
                <p className="text-xs leading-relaxed text-foreground/75 font-medium">
                  لتسريع تجهيز طلباتك، يرجى دائماً تأكيد الطلبات الجديدة بنقر زر الواتساب المتوفر بجانب كل فاتورة للتأكيد الفوري 100%.
                </p>
              </div>
            </div>

            {/* Main content display (8 cols) */}
            <div className="lg:col-span-8">
              
              {/* Tab 1: Orders History */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  {orders.length === 0 ? (
                    <div className="glass rounded-3xl p-12 text-center border border-border space-y-4">
                      <ShoppingBag className="w-16 h-16 text-foreground/30 mx-auto" />
                      <h3 className="text-xl font-bold">لا يوجد طلبيات مسجلة بعد</h3>
                      <p className="text-sm text-foreground/60 max-w-sm mx-auto">
                        لم تقم بتسجيل أي طلبات شراء أو حجز كابات تخرج حتى الآن. تفضل بتصفح المتجر الفاخر وحجز طلبك!
                      </p>
                      <Link href="/products" className="btn-premium inline-block px-8 py-3 text-sm">
                        تصفح المنتجات وحجز الآن
                      </Link>
                    </div>
                  ) : (
                    orders.map((ord) => {
                      const isExpanded = !!expandedOrders[ord.id];
                      const isCancelled = ord.status === "cancelled";
                      const currentStatusIndex = statusSteps.findIndex(step => step.key === ord.status);

                      return (
                        <div key={ord.id} className="glass rounded-2xl border border-border overflow-hidden transition-all hover:border-primary/20">
                          {/* Order Header Summary */}
                          <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface/40 border-b border-border/55">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-primary-light text-base tracking-wide">{ord.tracking_number}</span>
                                <span className="text-[10px] font-medium text-foreground/40">·</span>
                                <span className="text-xs text-foreground/60 flex items-center gap-1 font-semibold">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(ord.created_at).toLocaleDateString("ar-LY")}
                                </span>
                              </div>
                              <p className="text-xs text-foreground/60 font-semibold flex items-center gap-1">
                                <CreditCard className="w-3.5 h-3.5 text-primary" />
                                إجمالي الفاتورة: <span className="text-primary-light font-black">{ord.total_amount} د.ل</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Status Badge */}
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 ${
                                isCancelled ? "bg-red-500/15 text-red-400" : "bg-primary/10 text-primary-light"
                              }`}>
                                {statusTranslations[ord.status] || ord.status}
                              </span>

                              <a
                                href={getWhatsAppLink(ord)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                                title="تأكيد أو استفسار عبر الواتساب"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>

                              <button
                                onClick={() => toggleOrderDetails(ord.id)}
                                className="p-2 hover:bg-surface rounded-lg transition-colors border border-border/60"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Visual Stepper Progress Bar */}
                          {!isCancelled && (
                            <div className="px-6 py-6 border-b border-border/40 bg-black/10 overflow-x-auto">
                              <div className="min-w-[600px] flex justify-between items-center relative">
                                {/* Connective line */}
                                <div className="absolute right-0 left-0 top-3 h-0.5 bg-border z-0"></div>
                                <div 
                                  className="absolute right-0 top-3 h-0.5 bg-primary transition-all duration-500 z-0"
                                  style={{
                                    width: `${currentStatusIndex >= 0 ? (currentStatusIndex / (statusSteps.length - 1)) * 100 : 0}%`
                                  }}
                                ></div>

                                {statusSteps.map((step, stepIdx) => {
                                  const isDone = stepIdx <= currentStatusIndex;
                                  const isActive = stepIdx === currentStatusIndex;

                                  return (
                                    <div key={step.key} className="flex flex-col items-center gap-2 relative z-10">
                                      <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${
                                        isActive ? "bg-primary border-background shadow-[0_0_15px_rgba(201,168,76,0.5)] scale-110" :
                                        isDone ? "bg-primary border-primary" : "bg-surface border-border"
                                      }`}>
                                        {isDone && !isActive && <span className="w-1.5 h-1.5 bg-black rounded-full" />}
                                        {isActive && <div className="w-2 h-2 bg-black rounded-full" />}
                                      </div>
                                      <span className={`text-[10px] font-black transition-all ${
                                        isActive ? "text-primary-light" : isDone ? "text-foreground/80" : "text-foreground/40"
                                      }`}>
                                        {step.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Expansible Order Details */}
                          {isExpanded && (
                            <div className="p-6 bg-surface-hover/20 space-y-4">
                              <h4 className="font-bold text-sm text-foreground/80">محتويات الشحنة</h4>
                              <div className="space-y-3">
                                {ord.order_items?.map((item: any) => (
                                  <div key={item.id} className="flex gap-4 items-center border-b border-border/30 pb-3 last:border-0 last:pb-0">
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface border border-border shrink-0">
                                      <Image
                                        src={resolveAssetPath(item.product_image || "/placeholder.jpg")}
                                        alt={item.product_name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-bold text-xs text-foreground truncate">{item.product_name}</h5>
                                      <div className="flex items-center gap-2 mt-1 text-[10px] text-foreground/60">
                                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary-light font-bold">
                                          {item.item_mode === "rent" ? "إيجار" : "شراء"}
                                        </span>
                                        <span>الكمية: {item.quantity}</span>
                                      </div>
                                    </div>
                                    <span className="font-black text-xs text-primary-light shrink-0">
                                      {item.price_at_purchase * item.quantity} د.ل
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/40 text-xs font-semibold text-foreground/80 leading-relaxed">
                                <div className="space-y-1">
                                  <p className="text-foreground/50 text-[10px]">العنوان وتفاصيل التوصيل:</p>
                                  <p>{ord.guest_city} · {ord.guest_street} {ord.guest_address_detail ? `· ${ord.guest_address_detail}` : ""}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-foreground/50 text-[10px]">ملاحظات ومواصفات خاصة:</p>
                                  <p className="text-primary-light">{ord.customer_notes || "لا يوجد ملاحظات مضافة"}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab 2: Edit Profile & Shipping Details */}
              {activeTab === "profile" && (
                <form onSubmit={handleUpdateProfile} className="glass p-8 rounded-3xl border border-border space-y-6">
                  <h2 className="text-xl font-bold border-b border-border pb-4 mb-4">تفاصيل عنوان الشحن والتواصل الافتراضي</h2>

                  {saveSuccess && (
                    <div className="p-4 text-xs font-bold text-green-400 bg-green-950/20 border border-green-500/20 rounded-xl animate-pulse">
                      🎉 تم حفظ التعديلات بنجاح! سيتم تطبيقها تلقائياً على كافة طلبياتك القادمة.
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-foreground/80">الاسم بالكامل *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-semibold"
                    />
                  </div>

                  {/* Phone & Backup Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground/80">رقم الهاتف الأساسي *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-semibold text-left"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground/80">رقم الهاتف الاحتياطي</label>
                      <input
                        type="tel"
                        value={backupPhone}
                        onChange={(e) => setBackupPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-semibold text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* City & Street */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground/80">المدينة الافتراضية *</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-bold"
                      >
                        {Object.entries(cityNames).map(([key, name]) => (
                          <option key={key} value={key}>{name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground/80">الشارع *</label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-semibold"
                      />
                    </div>
                  </div>

                  {/* Additional Address Info */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-foreground/80">تفاصيل إضافية للعنوان (علامة مميزة، الطابق)</label>
                    <input
                      type="text"
                      value={addressDetail}
                      onChange={(e) => setAddressDetail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-semibold"
                    />
                  </div>

                  {/* Save Changes button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="btn-premium w-full py-4 text-base font-black flex items-center justify-center gap-2"
                    >
                      {saveLoading ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      ) : "حفظ التعديلات"}
                    </button>
                  </div>

                </form>
              )}

            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
