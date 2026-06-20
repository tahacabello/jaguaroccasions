"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  supabase,
  getSupabaseUserProfile,
  updateSupabaseUserProfile,
  resolveAssetPath,
  getSupabaseOrderChangeRequestsForUser,
  submitSupabaseOrderChangeRequest,
  cancelSupabaseOrderChangeRequest,
  requestOrderCancellation,
  OrderChangeRequest
} from "@/lib/supabase";
import { User, ShoppingBag, MapPin, Phone, LogOut, Package, RefreshCw, Calendar, CreditCard, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const statusTranslations: Record<string, string> = {
  new: "طلب جديد",
  waiting_confirmation: "بانتظار التأكيد",
  confirmed: "تم التأكيد",
  preparing: "قيد التجهيز",
  ready: "جاهز للتسليم",
  reserved: "محجوز",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const statusSteps = [
  { key: "new", label: "طلب جديد" },
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

// Helper to format Date cleanly in Arabic (e.g. السبت 2 نوفمبر 2025)
const formatArabicDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "غير محدد";
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  
  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];
  
  const dayName = days[dateObj.getDay()];
  const dayNum = dateObj.getDate();
  const monthName = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  
  return `${dayName} ${dayNum} ${monthName} ${year}`;
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

  // Order change request state
  const [changeRequests, setChangeRequests] = useState<OrderChangeRequest[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedOrderForRequest, setSelectedOrderForRequest] = useState<any>(null);

  // Modal fields
  const [requestEventDate, setRequestEventDate] = useState("");
  const [requestIsPreliminary, setRequestIsPreliminary] = useState(false);
  const [requestReturnOption, setRequestReturnOption] = useState<"same_day" | "next_day">("next_day");
  const [requestCustomerNotes, setRequestCustomerNotes] = useState("");
  const [requestPhone, setRequestPhone] = useState("");
  const [requestBackupPhone, setRequestBackupPhone] = useState("");
  const [requestCity, setRequestCity] = useState("tripoli");
  const [requestStreet, setRequestStreet] = useState("");
  const [requestAddressDetails, setRequestAddressDetails] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestCustomerNote, setRequestCustomerNote] = useState("");
  const [calculatedPickup, setCalculatedPickup] = useState("");
  const [calculatedReturn, setCalculatedReturn] = useState("");

  // Profile Edit fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [initialUsername, setInitialUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [backupPhone, setBackupPhone] = useState("");
  const [city, setCity] = useState("tripoli");
  const [street, setStreet] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");

  // UI state
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

  // Reload change requests
  const reloadChangeRequests = async (userId: string) => {
    try {
      const reqs = await getSupabaseOrderChangeRequestsForUser(userId);
      setChangeRequests(reqs || []);
    } catch (err) {
      console.error("Error reloading change requests:", err);
    }
  };

  // Open modal with prefilled data (either existing pending request or current order data)
  const handleOpenRequestModal = (order: any) => {
    setSelectedOrderForRequest(order);
    
    // Check if there is an existing pending request
    const pending = changeRequests.find(r => r.order_id === order.id && r.status === "pending");
    
    if (pending) {
      // Edit mode: pre-fill with pending request data
      const changes = pending.requested_changes || {};
      setRequestEventDate(changes.event_date || "");
      setRequestIsPreliminary(changes.is_preliminary_reservation || changes.is_preliminary || false);
      setRequestReturnOption(changes.return_option || "next_day");
      setRequestCustomerNotes(changes.customer_notes || "");
      setRequestPhone(changes.customer_phone || order.guest_phone || "");
      setRequestBackupPhone(changes.customer_backup_phone || order.guest_backup_phone || "");
      
      const cityVal = changes.customer_city || order.guest_city || "Tripoli";
      const cityKey = Object.keys(cityNames).find(key => cityNames[key] === cityVal || key === cityVal.toLowerCase()) || "tripoli";
      setRequestCity(cityKey);
      
      setRequestStreet(changes.customer_street || order.guest_street || "");
      setRequestAddressDetails(changes.customer_address_details || order.guest_address_detail || "");
      setRequestCustomerNote(pending.customer_note || "");
    } else {
      // New request mode: pre-fill with current order data
      setRequestEventDate(order.event_date || "");
      setRequestIsPreliminary(order.is_preliminary || false);
      setRequestReturnOption("next_day");
      setRequestCustomerNotes(order.customer_notes || "");
      setRequestPhone(order.guest_phone || "");
      setRequestBackupPhone(order.guest_backup_phone || "");
      
      const cityVal = order.guest_city || "Tripoli";
      const cityKey = Object.keys(cityNames).find(key => cityNames[key] === cityVal || key === cityVal.toLowerCase()) || "tripoli";
      setRequestCity(cityKey);
      
      setRequestStreet(order.guest_street || "");
      setRequestAddressDetails(order.guest_address_detail || "");
      setRequestCustomerNote("");
    }
    
    setShowRequestModal(true);
  };

  // Dynamically calculate pickup/return dates based on event date & option
  useEffect(() => {
    if (requestIsPreliminary || !requestEventDate) {
      setCalculatedPickup("");
      setCalculatedReturn("");
      return;
    }

    const evDate = new Date(requestEventDate);
    if (isNaN(evDate.getTime())) return;

    // Pickup calculation: 1 day before event
    let pickDate = new Date(evDate);
    pickDate.setDate(evDate.getDate() - 1);
    if (pickDate.getDay() === 5) { // Friday is 5
      pickDate.setDate(pickDate.getDate() - 1); // Move to Thursday
    }

    // Return calculation
    let retDate = new Date(evDate);
    if (requestReturnOption === "next_day") {
      retDate.setDate(evDate.getDate() + 1);
    }
    if (retDate.getDay() === 5) { // Friday is 5
      retDate.setDate(retDate.getDate() + 1); // Move to Saturday (the next non-Friday day)
    }

    const getYYYYMMDD = (d: Date) => {
      return d.toISOString().split('T')[0];
    };

    setCalculatedPickup(getYYYYMMDD(pickDate));
    setCalculatedReturn(getYYYYMMDD(retDate));
  }, [requestEventDate, requestReturnOption, requestIsPreliminary]);

  // Submit request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForRequest || !user) return;
    setSubmittingRequest(true);

    try {
      const changesPayload: any = {
        event_date: requestIsPreliminary ? null : requestEventDate,
        pickup_date: requestIsPreliminary ? null : calculatedPickup,
        return_date: requestIsPreliminary ? null : calculatedReturn,
        return_option: requestReturnOption,
        is_preliminary_reservation: requestIsPreliminary,
        customer_notes: requestCustomerNotes,
        customer_phone: requestPhone,
        customer_backup_phone: requestBackupPhone,
        customer_city: cityNames[requestCity] || requestCity,
        customer_street: requestStreet,
        customer_address_details: requestAddressDetails
      };

      const res = await submitSupabaseOrderChangeRequest(
        selectedOrderForRequest.id,
        user.id,
        changesPayload,
        requestCustomerNote
      );

      if (res.success) {
        alert("تم تقديم طلب التعديل بنجاح وبانتظار موافقة الإدارة.");
        setShowRequestModal(false);
        await reloadChangeRequests(user.id);
      } else {
        alert("فشل تقديم الطلب: " + res.error);
      }
    } catch (err: any) {
      alert("خطأ أثناء تقديم الطلب: " + err?.message);
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Cancel pending request
  const handleCancelRequest = async (requestId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء طلب التعديل المعلق؟")) return;
    try {
      const success = await cancelSupabaseOrderChangeRequest(requestId);
      if (success) {
        alert("تم إلغاء طلب التعديل بنجاح.");
        if (user) {
          await reloadChangeRequests(user.id);
        }
      } else {
        alert("فشل إلغاء الطلب.");
      }
    } catch (err: any) {
      alert("خطأ أثناء إلغاء الطلب: " + err?.message);
    }
  };

  // Request order cancellation request from customer
  const handleRequestCancellation = async (orderId: string) => {
    if (!confirm("هل أنت متأكد أنك تريد إرسال طلب إلغاء هذا الطلب؟")) return;
    try {
      const res = await requestOrderCancellation(orderId);
      if (res.success) {
        alert("تم إرسال طلب الإلغاء، بانتظار موافقة الإدارة.");
        // Refresh customer orders list
        if (user) {
          const { data: dbOrders, error } = await supabase
            .from("orders")
            .select("id, customer_id, guest_name, guest_phone, guest_backup_phone, guest_city, guest_street, guest_address_detail, customer_notes, status, payment_method, total_amount, tracking_number, deposit, remaining, event_date, pickup_date, return_date, is_preliminary, google_maps_link, created_at, order_items(*)")
            .eq("customer_id", user.id)
            .order("created_at", { ascending: false });

          if (dbOrders && !error) {
            setOrders(dbOrders);
          }
        }
      } else {
        alert("فشل إرسال طلب الإلغاء: " + res.error);
      }
    } catch (err: any) {
      alert("خطأ أثناء إرسال طلب الإلغاء: " + err?.message);
    }
  };

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
        setName(`${prof.first_name || ""} ${prof.last_name || ""}`.trim() || "");
        setUsername(prof.username || "");
        setInitialUsername(prof.username || "");
        setEmail(prof.email || "");
        setPhone(prof.phone_number || "");
        setBackupPhone(prof.backup_phone || "");
        const cityKey = Object.keys(cityNames).find(key => cityNames[key] === prof.city) || "tripoli";
        setCity(cityKey);
        setStreet(prof.street || "");
        setAddressDetail(prof.additional_address || "");
        setGoogleMapsLink(prof.google_maps_link || "");
      }

      // Fetch Customer Orders
      const { data: dbOrders, error } = await supabase
        .from("orders")
        .select("id, customer_id, guest_name, guest_phone, guest_backup_phone, guest_city, guest_street, guest_address_detail, customer_notes, status, payment_method, total_amount, tracking_number, deposit, remaining, event_date, pickup_date, return_date, is_preliminary, google_maps_link, created_at, order_items(*)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (dbOrders && !error) {
        setOrders(dbOrders);
      }

      // Fetch Customer Change Requests
      try {
        const reqs = await getSupabaseOrderChangeRequestsForUser(user.id);
        setChangeRequests(reqs || []);
      } catch (err) {
        console.error("Error fetching change requests:", err);
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

    const cleanUsername = username.trim().toLowerCase();

    // 1. If username was changed, verify uniqueness
    if (cleanUsername !== initialUsername) {
      if (!cleanUsername) {
        alert("اسم المستخدم مطلوب.");
        setSaveLoading(false);
        return;
      }
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Checking username error:", checkError);
      }

      if (existingUser) {
        alert("اسم المستخدم مستخدم بالفعل، يرجى اختيار اسم آخر");
        setSaveLoading(false);
        return;
      }
    }

    try {
      const success = await updateSupabaseUserProfile(user.id, {
        name,
        phone,
        backup_phone: backupPhone,
        city: cityNames[city] || city,
        street,
        additional_address: addressDetail,
        username: cleanUsername,
        email: email.trim(),
        google_maps_link: googleMapsLink.trim()
      });

      if (success) {
        setInitialUsername(cleanUsername);
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
    localStorage.removeItem("jaguar_admin_auth");
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

    return `https://wa.me/218921544663?text=${encodeURIComponent(message)}`;
  };

  const renderChangeRequestStatus = (ord: any) => {
    const latest = changeRequests
      .filter(r => r.order_id === ord.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (!latest || latest.status === "cancelled" || latest.status === "approved") {
      return null;
    }

    if (latest.status === "pending") {
      return (
        <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">طلب تعديل معلق</p>
              <p className="text-sm font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                طلب التعديل بانتظار موافقة الإدارة
              </p>
              <p className="text-xs text-foreground/70 font-semibold mt-1">
                لن يتم تطبيق التعديل إلا بعد موافقة الإدارة.
              </p>
            </div>
            {ord.status !== "completed" && ord.status !== "cancelled" && ord.cancellation_status !== "pending" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenRequestModal(ord)}
                  className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary-light border border-primary/20 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  تعديل طلب التغيير
                </button>
                <button
                  onClick={() => handleCancelRequest(latest.id)}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  إلغاء طلب التغيير
                </button>
              </div>
            )}
          </div>

          {/* Requested changes preview */}
          <div className="p-3 bg-black/25 rounded-lg text-xs space-y-2 border border-border/40 font-medium">
            <h5 className="font-bold text-foreground/80">التعديلات المطلوبة بانتظار الموافقة:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-foreground/90">
              {latest.requested_changes.is_preliminary_reservation ? (
                <p className="col-span-2 text-amber-400 font-semibold">⚠️ تحويل إلى حجز مبدئي (تأجيل تحديد الموعد)</p>
              ) : (
                <>
                  {latest.requested_changes.event_date && (
                    <p>📅 تاريخ المناسبة الجديد: <span className="text-primary-light font-bold">{formatArabicDate(latest.requested_changes.event_date)}</span></p>
                  )}
                  {latest.requested_changes.pickup_date && (
                    <p>🚚 تاريخ الاستلام الجديد: <span className="text-foreground/80">{formatArabicDate(latest.requested_changes.pickup_date)}</span></p>
                  )}
                  {latest.requested_changes.return_date && (
                    <p>🔄 تاريخ الإرجاع الجديد: <span className="text-foreground/80">{formatArabicDate(latest.requested_changes.return_date)}</span></p>
                  )}
                </>
              )}
              {latest.requested_changes.customer_phone && latest.requested_changes.customer_phone !== ord.guest_phone && (
                <p>📞 رقم الهاتف الجديد: {latest.requested_changes.customer_phone}</p>
              )}
              {latest.requested_changes.customer_city && latest.requested_changes.customer_city !== ord.guest_city && (
                <p>📍 المدينة الجديدة: {latest.requested_changes.customer_city}</p>
              )}
              {latest.requested_changes.customer_street && latest.requested_changes.customer_street !== ord.guest_street && (
                <p>📍 الشارع الجديد: {latest.requested_changes.customer_street}</p>
              )}
            </div>
            {latest.customer_note && (
              <p className="text-foreground/60 border-t border-border/30 pt-1.5 mt-1.5">
                💬 سبب التعديل: <span className="text-foreground/80 italic">"{latest.customer_note}"</span>
              </p>
            )}
          </div>
        </div>
      );
    }

    if (latest.status === "rejected") {
      return (
        <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-black text-red-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              تم رفض التعديل
            </p>
            {ord.status !== "completed" && ord.status !== "cancelled" && ord.cancellation_status !== "pending" && (
              <button
                onClick={() => handleOpenRequestModal(ord)}
                className="px-3 py-1 bg-primary hover:bg-primary-light text-black text-[10px] font-black rounded-lg transition-all cursor-pointer"
              >
                تقديم طلب جديد
              </button>
            )}
          </div>
          <p className="text-xs text-foreground/75 leading-relaxed font-semibold">
            عذراً، لم توافق الإدارة على طلب التعديل. يرجى التواصل عبر الواتساب للمساعدة.
          </p>
          {latest.admin_note && (
            <p className="text-xs text-red-400/80 font-bold">
              💬 سبب الرفض: "{latest.admin_note}"
            </p>
          )}
        </div>
      );
    }

    return null;
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
                حسابك
              </h1>
              <p className="text-foreground/60 text-sm mt-2">مرحباً بك، {profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "زبون جاغوار"}</p>
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
                        لم تقم بتسجيل أي طلبات شراء أو حجز كابات تخرج حتى الآن. تفضل بتصفح المتجر وحجز طلبك!
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
                                {changeRequests.some(r => r.order_id === ord.id && r.status === "pending") && (
                                  <span className="px-2 py-0.5 text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded flex items-center gap-0.5 animate-pulse">
                                    ⚠️ طلب تعديل معلق
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-foreground/60 font-semibold flex items-center gap-1">
                                <CreditCard className="w-3.5 h-3.5 text-primary" />
                                إجمالي الفاتورة: <span className="text-primary-light font-black">{ord.total_amount} د.ل</span>
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              {/* Status Badge */}
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 ${
                                isCancelled ? "bg-red-500/15 text-red-400" : "bg-primary/10 text-primary-light"
                              }`}>
                                {statusTranslations[ord.status] || ord.status}
                              </span>

                              {/* Cancellation Status Badge */}
                              {ord.status !== "cancelled" && ord.cancellation_status && ord.cancellation_status !== 'approved' && (
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 ${
                                  ord.cancellation_status === 'pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse' :
                                  'bg-red-500/15 text-red-400 border border-red-500/30'
                                }`}>
                                  {ord.cancellation_status === 'pending' ? 'طلب الإلغاء بانتظار موافقة الإدارة' :
                                   'تم رفض طلب الإلغاء'}
                                </span>
                              )}

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

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border/40 text-xs font-semibold text-foreground/80 leading-relaxed">
                                <div className="space-y-1">
                                  <p className="text-foreground/50 text-[10px]">العنوان وتفاصيل التوصيل:</p>
                                  <p>{ord.guest_city} · {ord.guest_street} {ord.guest_address_detail ? `· ${ord.guest_address_detail}` : ""}</p>
                                  {ord.google_maps_link && (
                                    <div className="mt-1.5">
                                      <a
                                        href={ord.google_maps_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-primary-light hover:bg-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold transition-all"
                                      >
                                        <span>📍 عرض موقع التوصيل على الخريطة</span>
                                      </a>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <p className="text-foreground/50 text-[10px]">جدولة وتواريخ الإيجار:</p>
                                  {ord.order_items?.some((i: any) => i.item_mode === "rent") ? (
                                    ord.is_preliminary ? (
                                      <p className="text-amber-400">⚠️ حجز مبدئي — لم يتم تحديد موعد المناسبة بعد</p>
                                    ) : (
                                      <div className="space-y-0.5 text-foreground/90">
                                        <p>🎓 المناسبة: <span className="text-primary-light font-bold">{formatArabicDate(ord.event_date)}</span></p>
                                        <p>🚚 الاستلام: {formatArabicDate(ord.pickup_date)}</p>
                                        <p>🔄 الإرجاع: {formatArabicDate(ord.return_date)}</p>
                                      </div>
                                    )
                                  ) : (
                                    <p className="text-foreground/40">شراء كامل (لا يوجد إيجار)</p>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <p className="text-foreground/50 text-[10px]">ملاحظات ومواصفات خاصة:</p>
                                  <p className="text-primary-light">{ord.customer_notes || "لا يوجد ملاحظات مضافة"}</p>
                                </div>
                              </div>

                              {renderChangeRequestStatus(ord)}

                              {/* Action Buttons & Status Info */}
                              <div className="pt-4 flex flex-col gap-3 border-t border-border/20 mt-2">
                                {ord.status !== "cancelled" && ord.status !== "completed" ? (
                                  ord.cancellation_status === "pending" ? (
                                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 font-black text-xs text-center flex items-center justify-center gap-1.5 animate-pulse">
                                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                      طلب الإلغاء بانتظار موافقة الإدارة
                                    </div>
                                  ) : (
                                    <>
                                      {ord.cancellation_status === "rejected" && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-bold text-xs">
                                          تم رفض طلب الإلغاء
                                        </div>
                                      )}
                                      
                                      <div className="flex flex-wrap justify-start gap-3">
                                        <a
                                          href={getWhatsAppLink(ord)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg font-black text-xs transition-all flex items-center gap-1.5 hover:scale-105"
                                        >
                                          <MessageCircle className="w-4.5 h-4.5" />
                                          واتساب للمساعدة
                                        </a>

                                        {/* Edit request button (only if no edit request is pending) */}
                                        {!changeRequests.some(r => r.order_id === ord.id && r.status === "pending") && (
                                          <button
                                            onClick={() => handleOpenRequestModal(ord)}
                                            className="px-4 py-2 bg-primary hover:bg-primary-light text-black rounded-lg font-black text-xs transition-all hover:scale-105 cursor-pointer"
                                          >
                                            طلب تعديل على الطلب
                                          </button>
                                        )}

                                        {/* Cancellation request button */}
                                        <button
                                          onClick={() => handleRequestCancellation(ord.id)}
                                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-lg font-black text-xs transition-all hover:scale-105 cursor-pointer"
                                        >
                                          طلب إلغاء الطلب
                                        </button>
                                      </div>
                                    </>
                                  )
                                ) : (
                                  /* For cancelled or completed orders, just show WhatsApp query option, but no cancel/edit actions */
                                  <div className="flex flex-wrap justify-start gap-3">
                                    <a
                                      href={getWhatsAppLink(ord)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg font-black text-xs transition-all flex items-center gap-1.5 hover:scale-105"
                                    >
                                      <MessageCircle className="w-4.5 h-4.5" />
                                      واتساب للمساعدة
                                    </a>
                                  </div>
                                )}
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

                  {/* Username & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground/80">اسم المستخدم (للدخول) *</label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-semibold text-left"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground/80">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-semibold text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

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

                  {/* Google Maps link */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-foreground/80">رابط الموقع على Google Maps — اختياري</label>
                    <input
                      type="url"
                      placeholder="https://maps.app.goo.gl/..."
                      value={googleMapsLink}
                      onChange={(e) => setGoogleMapsLink(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-semibold text-left"
                      dir="ltr"
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

      {/* modern gold/black modal for change requests */}
      {showRequestModal && selectedOrderForRequest && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[999] flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="glass rounded-3xl border border-primary/20 w-full max-w-xl max-h-[90vh] overflow-y-auto text-right p-6 md:p-8 space-y-6 relative">
            
            {/* Modal header */}
            <div className="flex justify-between items-start border-b border-border/60 pb-4">
              <div>
                <h3 className="text-xl font-black bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
                  طلب تعديل على الطلب
                </h3>
                <p className="text-xs text-foreground/50 mt-1">الطلبية رقم: <span className="text-primary font-bold">{selectedOrderForRequest.tracking_number}</span></p>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="w-8 h-8 rounded-full border border-border/80 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-surface transition-all text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-5 text-sm">
              
              {/* Event Schedule Section */}
              <div className="space-y-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <h4 className="font-bold text-xs text-primary-light">جدولة وتواريخ الإيجار</h4>
                
                {/* Preliminary Reservation switch */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="req_preliminary"
                    checked={requestIsPreliminary}
                    onChange={(e) => setRequestIsPreliminary(e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <label htmlFor="req_preliminary" className="font-bold text-xs text-foreground/80 cursor-pointer select-none">
                    حجز مبدئي (تأجيل تحديد موعد المناسبة لاحقاً)
                  </label>
                </div>

                {requestIsPreliminary ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-semibold leading-relaxed">
                    يمكنك تحديد موعد المناسبة لاحقاً، ولن يتم تطبيق أي تعديل إلا بعد موافقة الإدارة.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Event Date Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground/80">تاريخ المناسبة / التخرج *</label>
                      <input
                        type="date"
                        required={!requestIsPreliminary}
                        value={requestEventDate}
                        onChange={(e) => setRequestEventDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground font-semibold"
                        dir="ltr"
                      />
                    </div>

                    {/* Return Option */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground/80">خيار الإرجاع *</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRequestReturnOption("same_day")}
                          className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                            requestReturnOption === "same_day"
                              ? "bg-primary text-black border-primary"
                              : "bg-surface border-border text-foreground/75 hover:bg-surface-hover"
                          }`}
                        >
                          الإرجاع في نفس يوم المناسبة
                        </button>
                        <button
                          type="button"
                          onClick={() => setRequestReturnOption("next_day")}
                          className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                            requestReturnOption === "next_day"
                              ? "bg-primary text-black border-primary"
                              : "bg-surface border-border text-foreground/75 hover:bg-surface-hover"
                          }`}
                        >
                          الإرجاع في اليوم التالي للمناسبة
                        </button>
                      </div>
                    </div>

                    {/* Calculated pickup/return dates */}
                    {requestEventDate && (
                      <div className="p-3 bg-black/35 rounded-xl border border-border/50 text-xs space-y-1 font-semibold leading-relaxed">
                        <div className="flex justify-between items-center">
                          <span className="text-foreground/50">تاريخ الاستلام:</span>
                          <span className="text-primary-light font-bold">{formatArabicDate(calculatedPickup)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-foreground/50">تاريخ الإرجاع:</span>
                          <span className="text-primary-light font-bold">{formatArabicDate(calculatedReturn)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery and Phone Section */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-foreground/60 border-b border-border/40 pb-1">بيانات التواصل والتسليم</h4>
                
                {/* Phone & Backup */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">رقم الهاتف *</label>
                    <input
                      type="tel"
                      required
                      value={requestPhone}
                      onChange={(e) => setRequestPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground font-semibold text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">الهاتف الاحتياطي</label>
                    <input
                      type="tel"
                      value={requestBackupPhone}
                      onChange={(e) => setRequestBackupPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground font-semibold text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* City & Street */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">المدينة *</label>
                    <select
                      value={requestCity}
                      onChange={(e) => setRequestCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground font-bold"
                    >
                      {Object.entries(cityNames).map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">الشارع *</label>
                    <input
                      type="text"
                      required
                      value={requestStreet}
                      onChange={(e) => setRequestStreet(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground font-semibold"
                    />
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground/80">تفاصيل العنوان</label>
                  <input
                    type="text"
                    value={requestAddressDetails}
                    onChange={(e) => setRequestAddressDetails(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground font-semibold"
                  />
                </div>
              </div>

              {/* Notes Sections */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground/80">ملاحظات ومواصفات الطلبية (تطريز، الاسم..)</label>
                  <textarea
                    value={requestCustomerNotes}
                    onChange={(e) => setRequestCustomerNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground font-semibold min-h-[60px]"
                  />
                </div>

                <div className="space-y-1.5 p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                  <label className="block text-xs font-black text-amber-400">💬 سبب طلب التعديل (رسالة موجهة للإدارة) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: تغيير موعد حفل التخرج من الكلية أو تعديل رقم الهاتف للتسليم"
                    value={requestCustomerNote}
                    onChange={(e) => setRequestCustomerNote(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground font-semibold mt-1.5"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="btn-premium flex-1 py-3 text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingRequest ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : "إرسال طلب التعديل للإدارة"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-6 py-3 rounded-xl border border-border bg-surface hover:bg-surface-hover text-foreground font-bold text-sm cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
