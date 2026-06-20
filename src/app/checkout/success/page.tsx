"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  CheckCircle, MapPin, Phone, CreditCard, ChevronRight, ShoppingBag, 
  MessageCircle, AlertTriangle, Edit, Save, X, Sparkles, Check, RefreshCw 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseSettings, updateSupabaseOrderDetails } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  mode: string;
  customization_type?: string | null;
  layer_type?: string | null;
  color_sash?: string | null;
  color_text?: string | null;
  custom_text?: string | null;
  is_edged?: boolean | null;
}

interface SimulatedOrder {
  id: string;
  guest_name: string;
  guest_phone: string;
  guest_backup_phone?: string;
  guest_city: string;
  guest_street: string;
  guest_address_detail?: string;
  customer_notes?: string;
  status: string;
  payment_method: string;
  total_amount: number;
  tracking_number: string;
  created_at: string;
  items: OrderItem[];
  event_date?: string | null;
  pickup_date?: string | null;
  return_date?: string | null;
  is_preliminary?: boolean;
}

// Helper to format Date cleanly in Arabic (e.g. السبت 2 نوفمبر 2025)
const formatArabicDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "غير محدد";
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  
  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يونيو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];
  
  const dayName = days[dateObj.getDay()];
  const dayNum = dateObj.getDate();
  const monthName = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  
  return `${dayName} ${dayNum} ${monthName} ${year}`;
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<SimulatedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // Temp form fields
  const [tempName, setTempName] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [tempBackupPhone, setTempBackupPhone] = useState("");
  const [tempCity, setTempCity] = useState("");
  const [tempStreet, setTempStreet] = useState("");
  const [tempAddressDetail, setTempAddressDetail] = useState("");
  const [tempNotes, setTempNotes] = useState("");
  const [tempEventDate, setTempEventDate] = useState("");
  const [tempPickupDate, setTempPickupDate] = useState("");
  const [tempReturnDate, setTempReturnDate] = useState("");

  useEffect(() => {
    // Load dynamic settings to get WhatsApp number
    getSupabaseSettings().then(setSettings).catch(err => console.error("Error getting settings on success page:", err));

    if (!orderId) {
      setLoading(false);
      return;
    }

    // Try to load simulated order details from localStorage
    try {
      const stored = localStorage.getItem(`simulated_order_${orderId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setOrder(parsed);
        initFormFields(parsed);
      }
    } catch (e) {
      console.error("Failed to load order from localStorage", e);
    }
    setLoading(false);
  }, [orderId]);

  const initFormFields = (ord: SimulatedOrder) => {
    setTempName(ord.guest_name || "");
    setTempPhone(ord.guest_phone || "");
    setTempBackupPhone(ord.guest_backup_phone || "");
    setTempCity(ord.guest_city || "Tripoli");
    setTempStreet(ord.guest_street || "");
    setTempAddressDetail(ord.guest_address_detail || "");
    setTempNotes(ord.customer_notes || "");
    setTempEventDate(ord.event_date || "");
    setTempPickupDate(ord.pickup_date || "");
    setTempReturnDate(ord.return_date || "");
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || currentOrder.id === "demo-id") {
      alert("عذراً، لا يمكن تعديل الطلبات الافتراضية.");
      return;
    }

    setIsUpdating(true);
    setUpdateError("");
    setUpdateSuccess(false);

    try {
      const updates = {
        guest_name: tempName.trim(),
        guest_phone: tempPhone.trim(),
        guest_backup_phone: tempBackupPhone.trim(),
        guest_city: tempCity,
        guest_street: tempStreet.trim(),
        guest_address_detail: tempAddressDetail.trim(),
        customer_notes: tempNotes.trim(),
        total_amount: currentOrder.total_amount,
        status: currentOrder.status,
        event_date: tempEventDate || null,
        pickup_date: tempPickupDate || null,
        return_date: tempReturnDate || null,
        is_preliminary: currentOrder.is_preliminary
      };

      const success = await updateSupabaseOrderDetails(currentOrder.id, updates);
      if (!success) {
        throw new Error("فشل تحديث البيانات في قاعدة البيانات.");
      }

      // Update local state and localStorage
      const updatedOrder = {
        ...currentOrder,
        guest_name: tempName.trim(),
        guest_phone: tempPhone.trim(),
        guest_backup_phone: tempBackupPhone.trim(),
        guest_city: tempCity,
        guest_street: tempStreet.trim(),
        guest_address_detail: tempAddressDetail.trim(),
        customer_notes: tempNotes.trim(),
        event_date: tempEventDate || null,
        pickup_date: tempPickupDate || null,
        return_date: tempReturnDate || null,
      };

      setOrder(updatedOrder);
      localStorage.setItem(`simulated_order_${currentOrder.id}`, JSON.stringify(updatedOrder));
      setUpdateSuccess(true);
      setIsEditing(false);
      
      // Auto clear success message after 4s
      setTimeout(() => setUpdateSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setUpdateError(err.message || "فشل حفظ التعديلات.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no order is found, display standard placeholder success message
  const demoOrder: SimulatedOrder = {
    id: "demo-id",
    guest_name: "خريج جاغوار",
    guest_phone: "0912345678",
    guest_city: "طرابلس",
    guest_street: "حي الأندلس، بجانب مقهى زرياب",
    status: "new_order",
    payment_method: "cash_on_delivery",
    total_amount: 95,
    tracking_number: "JG-849302",
    created_at: new Date().toISOString(),
    items: [
      {
        id: "1",
        name: "كيبان كويتي",
        price: 85,
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop",
        quantity: 1,
        mode: "sale",
      }
    ]
  };

  const currentOrder = order || demoOrder;

  const paymentLabels: Record<string, string> = {
    cash_on_delivery: "الدفع عند الاستلام",
    sadad: "خدمة سداد (Sadad)",
    mobicash: "موبي كاش (MobiCash)",
  };

  // Generate WhatsApp confirmation link with pre-filled message detailing order
  const getWhatsAppLink = () => {
    const rawNumber = settings.whatsapp_number || "218921544663";
    const cleanNumber = rawNumber.replace(/\+/g, "").replace(/\s/g, "");
    
    const itemsList = currentOrder.items
      ? currentOrder.items.map(item => {
          let str = `📦 *${item.name}* (${item.mode === "rent" ? "إيجار" : "شراء"}) × ${item.quantity}`;
          if (item.custom_text && item.custom_text !== "none") {
            str += `\n   └ الاسم: ${item.custom_text}`;
          }
          if (item.color_sash && item.color_sash !== "none") {
            str += `\n   └ لون القماش: ${item.color_sash}`;
          }
          if (item.color_text && item.color_text !== "none") {
            str += `\n   └ لون الخط: ${item.color_text}`;
          }
          if (item.is_edged) {
            str += `\n   └ الحواف: مع حواف (+20 د.ل)`;
          }
          return str;
        }).join("\n")
      : "";

    let message = `*✨ تأكيد طلب جديد - متجر جاغوار للمناسبات ✨*\n\n`;
    message += `*📋 [بيانات الطلب]*\n`;
    message += `🏷️ *رقم الطلب:* ${currentOrder.tracking_number}\n`;
    message += `👤 *اسم الزبون:* ${currentOrder.guest_name}\n`;
    message += `📞 *رقم الهاتف:* ${currentOrder.guest_phone}\n`;
    if (currentOrder.guest_backup_phone) {
      message += `📱 *الهاتف الاحتياطي:* ${currentOrder.guest_backup_phone}\n`;
    }
    message += `📍 *المدينة:* ${currentOrder.guest_city}\n`;
    message += `🏠 *العنوان:* ${currentOrder.guest_street} ${currentOrder.guest_address_detail || ""}\n\n`;

    const hasRent = currentOrder.items?.some(item => item.mode === "rent");
    if (hasRent) {
      message += `*🎓 [تفاصيل وجدولة الإيجار]*\n`;
      if (currentOrder.is_preliminary) {
        message += `⚠️ *حالة الحجز:* حجز مبدئي — موعد المناسبة غير محدد بعد\n\n`;
      } else {
        message += `📅 *تاريخ المناسبة:* ${formatArabicDate(currentOrder.event_date)}\n`;
        message += `🚚 *تاريخ الاستلام:* ${formatArabicDate(currentOrder.pickup_date)}\n`;
        message += `🔄 *تاريخ الإرجاع:* ${formatArabicDate(currentOrder.return_date)}\n\n`;
      }
    }

    message += `*🛍️ [المنتجات والكمية]*\n${itemsList}\n\n`;
    
    message += `*💰 [تفاصيل الدفع]*\n`;
    message += `💳 *طريقة الدفع:* ${paymentLabels[currentOrder.payment_method] || currentOrder.payment_method}\n`;
    message += `💵 *إجمالي الحساب:* ${currentOrder.total_amount} د.ل\n\n`;

    if (currentOrder.customer_notes) {
      message += `*📝 [ملاحظات الزبون]*\n${currentOrder.customer_notes}`;
    } else {
      message += `*📝 [ملاحظات الزبون]:* لا توجد ملاحظات`;
    }

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  const citiesList = [
    { value: "Tripoli", label: "طرابلس (5 د.ل)" },
    { value: "Benghazi", label: "بنغازي (15 د.ل)" },
    { value: "Misrata", label: "مصراتة (10 د.ل)" },
    { value: "Zawiya", label: "الزاوية (10 د.ل)" },
    { value: "Khoms", label: "الخمس (10 د.ل)" },
    { value: "Zliten", label: "زليتن (10 د.ل)" },
    { value: "Tarhuna", label: "ترهونة (10 د.ل)" },
    { value: "Gharyan", label: "غريان (10 د.ل)" },
    { value: "Sabratha", label: "صبراتة (10 د.ل)" },
    { value: "Surt", label: "سرت (15 د.ل)" },
    { value: "Sebha", label: "سبها (25 د.ل)" },
    { value: "Tobruk", label: "طبرق (20 د.ل)" },
    { value: "Bayda", label: "البيضاء (20 د.ل)" },
    { value: "Ajdabiya", label: "أجدابيا (15 د.ل)" },
  ];

  return (
    <main className="min-h-screen bg-background pt-16 pb-24 text-right relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative z-10">
        
        {/* Header Celebratory Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 space-y-4"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative">
            <span className="absolute inset-0 rounded-full bg-emerald-500/5 animate-ping" />
            <CheckCircle className="w-14 h-14" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
            تم تسجيل طلبك بنجاح! 🎉
          </h1>
          <p className="text-foreground/70 text-lg max-w-md mx-auto font-medium">
            شكرًا لاختيارك <span className="text-primary-light font-bold">«جاغوار»</span>. يسعدنا جدًا أن نكون جزءاً من فرحة نجاحك وتخرجك الأسطوري!
          </p>
        </motion.div>

        {/* Success Alert Banner */}
        <AnimatePresence>
          {updateSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm flex items-center justify-center gap-2 mb-6 font-bold shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>تم تحديث تفاصيل الفاتورة بنجاح! تم تجديد رابط الواتساب بالبيانات الجديدة.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WhatsApp Urgent Action Notice */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative overflow-hidden glass p-8 rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-zinc-950 to-zinc-900 mb-8 space-y-6 text-center shadow-[0_0_40px_rgba(16,185,129,0.12)]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-center">
            <div className="p-3.5 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <MessageCircle className="w-9 h-9 animate-pulse text-emerald-400" />
            </div>
          </div>
          <div className="space-y-2.5">
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-wide gold-text-shimmer">
              ⚠️ خطوة أخيرة وضرورية للغاية!
            </h2>
            <p className="text-base font-bold text-gray-200 leading-relaxed max-w-xl mx-auto">
              طلبك الآن معلق بانتظار التأكيد! لضمان حجز قطع تخرجك وتجنب إلغاء طلبك تلقائياً خلال 24 ساعة، انقر فوراً على الزر أدناه لتأكيد حجزك مع خدمة العملاء عبر الواتساب.
            </p>
            <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
              انقر فوق الزر الأخضر لتفتح محادثة واتساب مجهزة بالكامل بفاتورتك ورمز التتبع لتأكيد حجز منتجاتك فوراً ودون كتابة أي شيء.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl text-lg sm:text-xl transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.35)] cursor-pointer"
            >
              <MessageCircle className="w-6 h-6 text-black fill-black" />
              تأكيد حجز الطلبية الآن عبر الواتساب
            </a>
          </div>
        </motion.div>

        {/* Edit Button trigger (Customer-facing edit) */}
        {!isEditing && currentOrder.id !== "demo-id" && (
          <div className="flex justify-end mb-6">
            <button 
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-2 text-primary-light transition-all duration-200 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>تعديل تفاصيل وعنوان الطلب</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Tracking Status & Items (7 cols) or Editing Panel */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Inline Editing Form */}
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="glass p-6 rounded-3xl border border-primary/20 space-y-5 bg-gradient-to-b from-zinc-950 to-zinc-900"
                >
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-primary" />
                      تعديل بيانات الحجز الخاصة بك
                    </h3>
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className="p-1 hover:bg-zinc-900 rounded text-gray-400 hover:text-white cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {updateError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg text-xs font-bold">
                      {updateError}
                    </div>
                  )}

                  <form onSubmit={handleSaveChanges} className="space-y-4 text-xs font-semibold">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-gray-400 font-bold">اسم الخريج / المستلم *</label>
                        <input 
                          type="text" 
                          required
                          value={tempName} 
                          onChange={(e) => setTempName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:outline-none rounded-xl p-2.5 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-gray-400 font-bold">رقم هاتف التواصل *</label>
                        <input 
                          type="text" 
                          required
                          value={tempPhone} 
                          onChange={(e) => setTempPhone(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:outline-none rounded-xl p-2.5 text-white text-left font-bold"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-gray-400 font-bold">الهاتف الاحتياطي</label>
                        <input 
                          type="text" 
                          value={tempBackupPhone} 
                          onChange={(e) => setTempBackupPhone(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:outline-none rounded-xl p-2.5 text-white text-left font-bold"
                          dir="ltr"
                          placeholder="مثال: 0921112233"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-gray-400 font-bold">مدينة التوصيل / الاستلام *</label>
                        <select 
                          value={tempCity} 
                          onChange={(e) => setTempCity(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:outline-none rounded-xl p-2.5 text-white font-bold"
                        >
                          {citiesList.map(city => (
                            <option key={city.value} value={city.value}>{city.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-gray-400 font-bold">المنطقة والشارع بالتفصيل *</label>
                        <input 
                          type="text" 
                          required
                          value={tempStreet} 
                          onChange={(e) => setTempStreet(e.target.value)}
                          placeholder="مثال: حي الأندلس خلف جامع الشريف"
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:outline-none rounded-xl p-2.5 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-gray-400 font-bold">تفاصيل إضافية للعنوان أو أقرب نقطة دالة</label>
                        <input 
                          type="text" 
                          value={tempAddressDetail} 
                          onChange={(e) => setTempAddressDetail(e.target.value)}
                          placeholder="مثال: بجانب صيدلية النور"
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:outline-none rounded-xl p-2.5 text-white"
                        />
                      </div>
                    </div>

                    {/* Show Dates only if it is a specific scheduled order (not preliminary) */}
                    {!currentOrder.is_preliminary && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-800 pt-3">
                        <div className="space-y-1">
                          <label className="block text-gray-400 font-bold">تاريخ المناسبة / الحفل</label>
                          <input 
                            type="date" 
                            required
                            value={tempEventDate} 
                            onChange={(e) => setTempEventDate(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:outline-none rounded-xl p-2.5 text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-gray-400 font-bold">تاريخ استلام الملابس</label>
                          <input 
                            type="date" 
                            required
                            value={tempPickupDate} 
                            onChange={(e) => setTempPickupDate(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:outline-none rounded-xl p-2.5 text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-gray-400 font-bold">تاريخ إرجاع الملابس</label>
                          <input 
                            type="date" 
                            required
                            value={tempReturnDate} 
                            onChange={(e) => setTempReturnDate(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:outline-none rounded-xl p-2.5 text-white"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-gray-400 font-bold">ملاحظات مقاس التطريز والأسماء المراد كتابتها</label>
                      <textarea 
                        rows={2}
                        value={tempNotes} 
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="مثال: تطريز اسم (أحمد) بالذهبي، مقاس الوشاح وسيع..."
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary focus:outline-none rounded-xl p-2.5 text-white text-xs resize-none"
                      />
                    </div>

                    <div className="flex gap-2 justify-end border-t border-zinc-800 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-zinc-900 hover:bg-zinc-800 text-gray-400 py-2 px-4 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="bg-emerald-600 hover:bg-emerald-500 text-black py-2 px-5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                      >
                        {isUpdating ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                        حفظ التعديلات وتجديد الواتساب
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Order Tracking Progress */}
                  <div className="glass p-6 rounded-3xl border border-border space-y-6">
                    <h3 className="text-lg font-bold border-b border-border pb-3">حالة الطلب الحالية</h3>
                    
                    <div className="relative pl-4 space-y-8 before:absolute before:right-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                      
                      {/* Step 1 - active */}
                      <div className="relative pr-8 flex items-start gap-4">
                        <div className="absolute right-0 top-1 w-7 h-7 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center z-10">
                          <div className="w-2.5 h-2.5 bg-black rounded-full" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-emerald-400">طلب جديد (بانتظار التأكيد بالواتساب)</h4>
                          <p className="text-xs text-foreground/60 mt-1">
                            تم تسجيل حجزك المبدئي بنجاح، يرجى نقر زر الواتساب لإرسال بيانات الفاتورة وتأكيد حجز القطع مباشرة.
                          </p>
                        </div>
                      </div>

                      {/* Step 2 - inactive */}
                      <div className="relative pr-8 flex items-start gap-4 opacity-50">
                        <div className="absolute right-0 top-1 w-7 h-7 rounded-full bg-border border-4 border-background flex items-center justify-center z-10">
                          <div className="w-2 h-2 bg-foreground/30 rounded-full" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">تطريز الملابس وتجهيز الحفل</h4>
                          <p className="text-xs text-foreground/60 mt-1">كتابة وتطريز الأسماء على الأوشحة والقبعات حسب ملاحظاتك بدقة متناهية.</p>
                        </div>
                      </div>

                      {/* Step 3 - inactive */}
                      <div className="relative pr-8 flex items-start gap-4 opacity-50">
                        <div className="absolute right-0 top-1 w-7 h-7 rounded-full bg-border border-4 border-background flex items-center justify-center z-10">
                          <div className="w-2 h-2 bg-foreground/30 rounded-full" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">جاهز للتسليم / للشحن</h4>
                          <p className="text-xs text-foreground/60 mt-1">تعبئة مستلزمات الحفل لتسليمها لك من المعرض أو شحنها لعنوانك.</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {currentOrder.items?.some(item => item.mode === "rent") && settings.rental_policy && (
                    <div className="glass p-6 rounded-3xl border border-primary/20 bg-primary/5 space-y-3">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <AlertTriangle className="w-5 h-5 text-primary animate-bounce" />
                        <span>شروط وتعهدات الإيجار</span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                        {settings.rental_policy}
                      </p>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="glass p-6 rounded-3xl border border-border space-y-4">
                    <h3 className="text-lg font-bold border-b border-border pb-3">محتويات الطلبية</h3>
                    <div className="space-y-4">
                      {currentOrder.items?.map((item) => (
                        <div key={`${item.id}-${item.mode}`} className="flex gap-4 items-center hover:bg-zinc-900/10 p-1 rounded-xl transition-all">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface border border-border shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-foreground truncate">{item.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary-light font-black">
                                {item.mode === "rent" ? "إيجار للمناسبة" : "شراء وتمليك"}
                              </span>
                              <span className="text-xs text-foreground/60">العدد: {item.quantity}</span>
                            </div>
                            {item.custom_text && item.custom_text !== "none" && (
                              <p className="text-[11px] font-bold text-primary mt-1">
                                الاسم: {item.custom_text}
                              </p>
                            )}
                            {item.color_sash && item.color_sash !== "none" && (
                              <p className="text-[10px] text-foreground/60">
                                لون القماش: {item.color_sash}
                              </p>
                            )}
                            {item.color_text && item.color_text !== "none" && (
                              <p className="text-[10px] text-foreground/60">
                                لون التطريز/الطباعة: {item.color_text}
                              </p>
                            )}
                            {item.is_edged && (
                              <p className="text-[10px] text-primary-light font-semibold">
                                حواف الشال: مع حواف (+20 د.ل)
                              </p>
                            )}
                          </div>
                          <span className="font-black text-sm text-primary-light shrink-0">
                            {item.price * item.quantity} د.ل
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Order Summary & Customer details (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Order Metadata */}
            <div className="glass p-6 rounded-3xl border border-border space-y-4 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900">
              <h3 className="text-lg font-bold border-b border-border pb-3">ملخص الحساب</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">كود تتبع الحجز:</span>
                  <span className="font-black text-primary-light tracking-widest">{currentOrder.tracking_number}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-foreground/60">تاريخ الطلب:</span>
                  <span className="font-bold">
                    {new Date(currentOrder.created_at).toLocaleDateString("ar-LY", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-border/40 pt-3">
                  <span className="text-foreground/60">إجمالي المطلوب سداده:</span>
                  <span className="font-black text-lg text-primary-light">{currentOrder.total_amount} د.ل</span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="glass p-6 rounded-3xl border border-border space-y-4">
              <h3 className="text-lg font-bold border-b border-border pb-3">بيانات التوصيل والعنوان</h3>

              <div className="space-y-4 text-sm font-semibold">
                <div className="flex gap-3 items-start">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-foreground/65 text-xs">العنوان بالتفصيل:</h4>
                    <p className="text-foreground mt-1">
                      {citiesList.find(c => c.value === currentOrder.guest_city)?.label.split(" (")[0] || currentOrder.guest_city} · {currentOrder.guest_street}
                      {currentOrder.guest_address_detail ? ` · ${currentOrder.guest_address_detail}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-foreground/65 text-xs">هواتف التواصل:</h4>
                    <p className="text-foreground mt-1" dir="ltr">
                      {currentOrder.guest_phone}
                      {currentOrder.guest_backup_phone ? ` / ${currentOrder.guest_backup_phone}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <CreditCard className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-foreground/65 text-xs">طريقة الدفع المختارة:</h4>
                    <p className="text-foreground mt-1">
                      {paymentLabels[currentOrder.payment_method] || currentOrder.payment_method}
                    </p>
                  </div>
                </div>

                {currentOrder.customer_notes && (
                  <div className="border-t border-border/30 pt-3 flex gap-3 items-start">
                    <span className="text-xs text-primary">📝</span>
                    <div>
                      <h4 className="text-foreground/65 text-xs">ملاحظات الأسماء والتطريز:</h4>
                      <p className="text-foreground mt-1 font-bold italic text-xs leading-relaxed text-amber-500/90">
                        "{currentOrder.customer_notes}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rental Scheduling Details */}
            {currentOrder.items?.some(item => item.mode === "rent") && (
              <div className="glass p-6 rounded-3xl border border-border space-y-4">
                <h3 className="text-lg font-bold border-b border-border pb-3 flex items-center gap-2">
                  <span>🗓️</span>
                  <span>بيانات وجدولة الحجز والتواريخ</span>
                </h3>

                <div className="space-y-3 text-sm font-semibold">
                  {currentOrder.is_preliminary ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-xs leading-relaxed">
                      💡 **حجز مبدئي:** لم يتم تحديد موعد المناسبة والتخرج بعد. يرجى التنسيق مع المعرض عبر الواتساب لاحقاً لتأكيد التواريخ النهائية.
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-foreground/60">تاريخ المناسبة / الحفل:</span>
                        <span className="text-primary-light font-black">{formatArabicDate(currentOrder.event_date)}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-foreground/60">تاريخ الاستلام:</span>
                        <span className="font-bold">{formatArabicDate(currentOrder.pickup_date)}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-foreground/60">تاريخ الإرجاع:</span>
                        <span className="font-bold">{formatArabicDate(currentOrder.return_date)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-4 pt-4">
              <Link href="/products" className="btn-premium w-full py-4 text-center text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                <ShoppingBag className="w-4 h-4" />
                مواصلة التسوق وتصفح المزيد
              </Link>
              <Link
                href="/"
                className="w-full py-4 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-colors font-bold text-sm flex items-center justify-center gap-1 hover:scale-[1.02]"
              >
                الرجوع للصفحة الرئيسية
                <ChevronRight className="w-4 h-4 rotate-180" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}
