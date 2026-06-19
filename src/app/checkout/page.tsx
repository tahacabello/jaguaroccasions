"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { supabase, addSupabaseOrder, getSupabaseSettings, getSupabaseUserProfile } from "@/lib/supabase";
import { ShoppingBag, CreditCard, ShieldCheck, Ticket, Check, MapPin, Phone, Info } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
const formatArabicDate = (dateStr: string) => {
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

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart, isLoaded } = useCart();

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [backupPhone, setBackupPhone] = useState("");
  const [city, setCity] = useState("tripoli");
  const [street, setStreet] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [notes, setNotes] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "sadad" | "mobicash">("cash_on_delivery");
  
  // Rental dates & preliminary reservation state
  const [isPreliminary, setIsPreliminary] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [returnOption, setReturnOption] = useState<"same_day" | "next_day">("next_day");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  
  // Auth state
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Coupon Engine State
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Calculations (completely removed shipping fees)
  const discountAmount = Math.round(cartTotal * (discountPercent / 100));
  const finalTotal = cartTotal - discountAmount;

  // Prefill authenticated customer details
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCustomerId(user.id);
        getSupabaseUserProfile(user.id).then((profile) => {
          if (profile) {
            setName(profile.name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "");
            setPhone(profile.phone_number || "");
            setBackupPhone(profile.backup_phone || "");
            const cityKey = Object.keys(cityNames).find(key => cityNames[key] === profile.city) || "tripoli";
            setCity(cityKey);
            setStreet(profile.street || "");
            setAddressDetail(profile.additional_address || "");
            setGoogleMapsLink(profile.google_maps_link || "");
          }
        });
      }
    });
  }, []);

  // Fetch dynamic settings
  useEffect(() => {
    getSupabaseSettings().then(setSettings).catch(err => console.error("Error getting settings in Checkout:", err));
  }, []);

  // Protect page: redirect to products if cart is empty (unless submitting)
  useEffect(() => {
    if (isLoaded && cartItems.length === 0 && !isSubmitting) {
      router.push("/products");
    }
  }, [isLoaded, cartItems, router, isSubmitting]);

  // Auto-calculate pickup date and return date based on selected eventDate and returnOption
  useEffect(() => {
    if (!eventDate) {
      setPickupDate("");
      setReturnDate("");
      return;
    }

    const evDate = new Date(eventDate);
    if (isNaN(evDate.getTime())) return;

    // 1. Calculate Pickup: 1 day before event
    let pickDate = new Date(evDate);
    pickDate.setDate(evDate.getDate() - 1);
    if (pickDate.getDay() === 5) { // Friday is 5
      pickDate.setDate(pickDate.getDate() - 1); // Move to Thursday
    }

    // 2. Calculate Return
    let retDate = new Date(evDate);
    if (returnOption === "next_day") {
      retDate.setDate(evDate.getDate() + 1);
    }
    if (retDate.getDay() === 5) { // Friday is 5
      retDate.setDate(retDate.getDate() + 1); // Move to Saturday (the next non-Friday day)
    }

    const getYYYYMMDD = (d: Date) => {
      return d.toISOString().split('T')[0];
    };

    setPickupDate(getYYYYMMDD(pickDate));
    setReturnDate(getYYYYMMDD(retDate));
  }, [eventDate, returnOption]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (cartItems.length === 0 && !isSubmitting) {
    return null;
  }

  // Enforce mandatory login for checkout
  const isLoggedIn = !!customerId;

  if (!isLoggedIn && isLoaded) {
    return (
      <>
        <Header />
        <main className="min-h-[80vh] bg-background pt-24 pb-24 text-right flex items-center justify-center">
          <div className="container mx-auto px-4 max-w-md">
            <div className="glass p-8 rounded-3xl border border-border text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-transparent to-primary opacity-50"></div>
              
              <div className="w-16 h-16 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center mx-auto text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>
              
              <h1 className="text-2xl font-black bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
                تسجيل الدخول مطلوب
              </h1>
              
              <p className="text-sm text-foreground/75 leading-relaxed">
                يرجى تسجيل الدخول أو إنشاء حساب جديد لإتمام الطلب وحجز كابات تخرجك ومتابعة حالتها.
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href={`/auth/login?redirect=/checkout`}
                  className="btn-premium w-full py-3 text-sm font-black flex items-center justify-center gap-1.5"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href={`/auth/register?redirect=/checkout`}
                  className="w-full py-3 rounded-xl border border-border hover:border-primary/50 bg-surface hover:bg-surface-hover text-foreground transition-all font-bold text-sm flex items-center justify-center gap-1.5"
                >
                  إنشاء حساب جديد
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Handle coupon validation
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    if (couponCode.toUpperCase() === "GRAD2026") {
      setDiscountPercent(10); // 10% off
      setCouponSuccess("تم تطبيق كوبون التخرج بنجاح! خصم 10%");
    } else if (couponCode.toUpperCase() === "JAGUAR") {
      setDiscountPercent(15); // 15% off
      setCouponSuccess("تم تطبيق الكوبون الذهبي بنجاح! خصم 15%");
    } else {
      setCouponError("الكوبون غير صحيح أو منتهي الصلاحية");
    }
  };

  // Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !street) {
      alert("الرجاء ملء جميع الحقول المطلوبة للتوصيل");
      return;
    }

    const hasRentItems = cartItems.some(item => item.mode === "rent");
    if (hasRentItems && !agreeToPolicy) {
      alert("يرجى الموافقة على سياسة الإيجار قبل إتمام الطلب");
      return;
    }

    setIsSubmitting(true);

    try {
      const trackingNumber = `JG-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const rentalItem = cartItems.find(item => item.mode === "rent");
      const firstItem = cartItems[0];

      // 1. Prepare Order Payload
      const orderPayload = {
        customer_id: customerId,
        guest_name: name,
        guest_phone: phone,
        guest_backup_phone: backupPhone,
        guest_city: cityNames[city] || city,
        guest_street: street,
        guest_address_detail: addressDetail,
        customer_notes: notes,
        status: "new", // Standardised to 'new' instead of 'new_order'
        payment_method: "cash_on_delivery", // Enforced CoD only
        total_amount: finalTotal,
        tracking_number: trackingNumber,
        event_date: rentalItem?.pickup_date || null,
        pickup_date: rentalItem?.pickup_date || firstItem?.pickup_date || null,
        return_date: rentalItem?.return_date || null,
        is_preliminary: rentalItem ? (rentalItem.is_preliminary || false) : (firstItem?.is_preliminary || false),
        google_maps_link: googleMapsLink.trim(),
      };

      // 2. Insert into Supabase
      const result = await addSupabaseOrder(orderPayload, cartItems);

      if (!result.success) {
        throw new Error(result.error || "خطأ أثناء إضافة الطلبية");
      }

      const dbOrderId = result.data.id;

      // 3. Save order to localStorage for success page retrieval (crucial for guest views & instant page reload)
      const cachedOrder = {
        id: dbOrderId,
        ...orderPayload,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          mode: item.mode,
          customization_type: item.customization_type || null,
          layer_type: item.layer_type || null,
          color_sash: item.color_sash || null,
          color_text: item.color_text || null,
          custom_text: item.custom_text || null,
          pickup_date: item.pickup_date || null,
          return_date: item.return_date || null,
          is_preliminary: item.is_preliminary || false
        })),
        created_at: new Date().toISOString(),
      };
      
      localStorage.setItem(`simulated_order_${dbOrderId}`, JSON.stringify(cachedOrder));

      // 4. Clear Cart & Redirect to Success Page
      clearCart();
      router.push(`/checkout/success?id=${dbOrderId}`);
    } catch (error: any) {
      console.error("Order submission failed:", error);
      alert(`حدث خطأ أثناء إتمام الطلب: ${error?.message || "يرجى المحاولة مرة أخرى."}`);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-12 pb-24 text-right">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          
          <h1 className="text-3xl md:text-5xl font-black mb-12 text-right bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
            إتمام الطلب
          </h1>

          {/* WhatsApp confirmation prompt */}
          <div className="mb-8 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3 text-primary-light animate-fadeIn">
            <Info className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold leading-relaxed">
              💡 **ملاحظة هامة:** لتأكيد وإتمام طلبك 100%، يرجى التواصل معنا عبر الواتساب فور الانتهاء من ملء البيانات وتقديم الطلب.
            </p>
          </div>

          {/* Visual Pickup Timeline */}
          <div className="mb-8 p-6 rounded-3xl glass-premium border border-primary/20 space-y-6 animate-fadeIn">
            <h3 className="text-lg font-black text-primary-light flex items-center gap-2">
              <span>📅 المخطط الزمني المقدر لاستلام الطلب</span>
            </h3>
            
            <div className="relative border-r-2 border-primary/20 mr-4 pr-6 space-y-8 text-right">
              {cartItems.map((item) => {
                return (
                  <div key={item.cartKey} className="relative">
                    {/* Circle marker */}
                    <div className="absolute top-1.5 -right-[31px] w-4 h-4 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-light animate-ping"></div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-foreground">{item.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                          item.mode === 'rent' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25' : 'bg-green-500/10 text-green-400 border border-green-500/25'
                        }`}>
                          {item.mode === 'rent' ? 'إيجار' : 'شراء'}
                        </span>
                      </div>
                      
                      <p className="text-xs text-foreground/75 font-semibold">
                        📍 موعد الاستلام: {" "}
                        {item.is_preliminary ? (
                          <span className="text-primary-light font-bold">أول ما يجهز (خلال 3 - 5 أيام من الطلب)</span>
                        ) : item.pickup_date ? (
                          <span className="text-foreground font-black">{formatArabicDate(item.pickup_date)}</span>
                        ) : (
                          <span className="text-foreground/50">غير محدد</span>
                        )}
                        {item.mode === 'rent' && item.return_date && (
                          <>
                            {" | "}
                            <span>🔄 موعد الإرجاع: </span>
                            <span className="text-foreground font-black">{formatArabicDate(item.return_date)}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <p className="text-xs text-foreground/50 pt-2 border-t border-border/40">
              * يتم إبلاغك تلقائياً عند تجهيز الشيلات المخصصة للاستلام فوراً، بينما يتم حجز الكابات والقبعات لتاريخ استلامها المحدد.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Form Details (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Form panel */}
              <form onSubmit={handlePlaceOrder} className="glass p-8 rounded-3xl border border-border space-y-6">
                <h2 className="text-2xl font-bold border-b border-border pb-4 mb-6">تفاصيل عنوان الشحن والتوصيل</h2>

                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-foreground/80">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: أحمد عبد الله الفرجاني"
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
                      placeholder="مثال: 091XXXXXXX"
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
                      placeholder="مثال: 092XXXXXXX"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-semibold text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* City & Street */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-foreground/80">المدينة *</label>
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
                    <label className="block text-sm font-bold text-foreground/80">الشارع بالتفصيل *</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="مثال: شارع النصر، خلف فندق تيبستي"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-semibold"
                    />
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-foreground/80">تفاصيل إضافية للعنوان</label>
                  <input
                    type="text"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    placeholder="مثال: بجانب مقهى السلام، عمارة رقم 4، الطابق الثالث"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-semibold"
                  />
                </div>

                {/* Google Maps Link */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-foreground/80">رابط الموقع على Google Maps — اختياري</label>
                  <input
                    type="url"
                    value={googleMapsLink}
                    onChange={(e) => setGoogleMapsLink(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-semibold text-left font-sans"
                    dir="ltr"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-foreground/80">ملاحظات الزبون (مثل مقاس التطريز، الكتابة المخصصة)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="اكتب أي ملاحظات إضافية ترغب بإطلاعنا عليها..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-semibold"
                  />
                </div>

                {/* Payment Method selection */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-bold text-foreground">طريقة الدفع المختارة</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all border-primary bg-primary/5 text-primary-light font-bold`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={true}
                        readOnly
                        className="accent-primary"
                      />
                      <span>الدفع عند الاستلام</span>
                    </label>

                    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface/30 opacity-50 cursor-not-allowed select-none">
                      <input
                        type="radio"
                        name="payment"
                        disabled
                        className="accent-primary"
                      />
                      <span className="flex flex-col text-right">
                        <span>خدمة سداد (Sadad)</span>
                        <span className="text-[10px] text-primary font-bold">قريباً (Coming Soon)</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface/30 opacity-50 cursor-not-allowed select-none">
                      <input
                        type="radio"
                        name="payment"
                        disabled
                        className="accent-primary"
                      />
                      <span className="flex flex-col text-right">
                        <span>موبي كاش (MobiCash)</span>
                        <span className="text-[10px] text-primary font-bold">قريباً (Coming Soon)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {cartItems.some(item => item.mode === "rent") && settings.rental_policy && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-right space-y-3 shadow-lg">
                      <div className="flex items-center gap-2 text-primary font-bold text-base border-b border-amber-500/10 pb-2">
                        <Info className="w-5 h-5 text-primary" />
                        <span>سياسة الإيجار</span>
                      </div>
                      <p className="text-xs text-foreground/85 leading-relaxed whitespace-pre-line">
                        {settings.rental_policy}
                      </p>
                    </div>

                    <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface hover:bg-surface-hover cursor-pointer transition-all select-none">
                      <input
                        type="checkbox"
                        checked={agreeToPolicy}
                        onChange={(e) => setAgreeToPolicy(e.target.checked)}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary accent-primary shrink-0"
                      />
                      <span className="text-xs md:text-sm font-bold text-foreground/90">
                        أوافق على سياسة الإيجار وشروط الاستلام والإرجاع
                      </span>
                    </label>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-premium py-4 text-lg font-black flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        تأكيد الطلب وحجز المنتجات
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Guarantees panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl glass border border-border flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">مراجعة ومعاينة الطلب</h4>
                    <p className="text-xs text-foreground/60">افحص خاماتك بالكامل عند الاستلام والتسليم</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl glass border border-border flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">طرق دفع آمنة وسهلة</h4>
                    <p className="text-xs text-foreground/60">ادفع كاش عند الاستلام أو بتحويل مصرفي مباشر</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="glass p-6 rounded-3xl border border-border space-y-6 sticky top-24">
                <h2 className="text-xl font-bold border-b border-border pb-4 mb-4">ملخص الطلب</h2>

                {/* Items list */}
                <div className="max-h-[300px] overflow-y-auto space-y-4 pr-1">
                  {cartItems.map((item) => (
                    <div key={item.cartKey} className="flex gap-4 items-start border-b border-border/10 pb-3 last:border-0 last:pb-0">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface border border-border shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-foreground truncate">{item.name}</h4>
                        
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary-light font-bold">
                            {item.mode === "rent" ? "إيجار" : "شراء"}
                          </span>
                          {item.layer_type && item.layer_type !== "none" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-hover border border-border text-foreground/75 font-semibold">
                              {item.layer_type === "double" ? "ثنائي" : "ثلاثي"}
                            </span>
                          )}
                          {item.customization_type && item.customization_type !== "none" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-hover border border-border text-foreground/75 font-semibold">
                              {item.customization_type === "embroidery" ? "تطريز" : "طباعة"}
                            </span>
                          )}
                          <span className="text-[10px] text-foreground/60 mr-auto">العدد: {item.quantity}</span>
                        </div>

                        {item.custom_text && item.custom_text !== "none" && (
                          <p className="text-xs text-foreground/70 mt-1 font-bold">
                            الاسم: <span className="text-primary">{item.custom_text}</span>
                          </p>
                        )}
                        {(item.pickup_date || item.is_preliminary) && (
                          <p className="text-[10px] text-foreground/60 mt-0.5">
                            🗓️ استلام: {item.is_preliminary ? "أول ما يجهز" : item.pickup_date}
                          </p>
                        )}
                      </div>
                      <span className="font-black text-sm text-primary-light shrink-0">
                        {item.price * item.quantity} د.ل
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Input */}
                <form onSubmit={handleApplyCoupon} className="pt-4 border-t border-border space-y-2">
                  <label className="block text-xs font-bold text-foreground/60">هل لديك كوبون خصم؟</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="أدخل رمز الكوبون"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-4 py-2 text-sm rounded-lg border border-border bg-surface focus:outline-none focus:border-primary font-bold uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-surface hover:bg-primary hover:text-black border border-border hover:border-primary transition-all rounded-lg text-sm font-bold flex items-center gap-1 shrink-0"
                    >
                      <Ticket className="w-4 h-4" />
                      تطبيق
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-400 font-bold mt-1">{couponError}</p>}
                  {couponSuccess && <p className="text-xs text-green-400 font-bold mt-1">{couponSuccess}</p>}
                </form>

                {/* Price Breakdown (strictly removed shipping costs) */}
                <div className="pt-6 border-t border-border space-y-3 font-semibold text-sm">
                  <div className="flex justify-between text-foreground/85">
                    <span>المجموع الفرعي:</span>
                    <span>{cartTotal} د.ل</span>
                  </div>
                  
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>الخصم ({discountPercent}%):</span>
                      <span>-{discountAmount} د.ل</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-lg border-t border-border pt-4 font-black">
                    <span className="text-foreground">المجموع الإجمالي:</span>
                    <span className="text-2xl text-primary-light">{finalTotal} د.ل</span>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 text-xs leading-relaxed text-primary-light/90">
                  💡 **كوبونات تهمك:** استخدم الكوبون **GRAD2026** للحصول على خصم 10% أو **JAGUAR** للحصول على خصم 15% بمناسبة الموسم الجديد!
                </div>

              </div>

            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
