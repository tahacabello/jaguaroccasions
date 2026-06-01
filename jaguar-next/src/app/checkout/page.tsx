"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, CreditCard, Truck, ShieldCheck, Ticket, Check } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Dynamic shipping fees per city in Libya
const shippingFees: Record<string, number> = {
  tripoli: 10,
  benghazi: 25,
  misrata: 15,
  khoms: 15,
  zawiya: 12,
  sebha: 35,
  garian: 15,
  tobruk: 30,
  other: 25,
};

const cityNames: Record<string, string> = {
  tripoli: "طرابلس",
  benghazi: "بنغازي",
  misrata: "مصراتة",
  khoms: "الخمس",
  zawiya: "الزاوية",
  sebha: "سبها",
  garian: "غريان",
  tobruk: "طبرق",
  other: "مدينة أخرى",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart, isLoaded } = useCart();

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("tripoli");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "sadad" | "mobicash">("cash_on_delivery");
  
  // Coupon Engine State
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculations
  const shippingFee = shippingFees[city] || 15;
  const discountAmount = Math.round(cartTotal * (discountPercent / 100));
  const finalTotal = cartTotal + shippingFee - discountAmount;

  // Protect page: redirect to products if cart is empty (unless submitting)
  useEffect(() => {
    if (isLoaded && cartItems.length === 0 && !isSubmitting) {
      router.push("/products");
    }
  }, [isLoaded, cartItems, router, isSubmitting]);

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
    if (!name || !phone || !address) {
      alert("الرجاء ملء جميع الحقول المطلوبة لضمان دقة التوصيل");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Prepare Order Payload
      const orderData = {
        guest_name: name,
        guest_phone: phone,
        guest_city: cityNames[city],
        guest_address: address,
        status: "pending",
        payment_method: paymentMethod,
        total_amount: finalTotal,
        shipping_fee: shippingFee,
        tracking_number: `JG-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      let orderId = "";

      // 2. Insert into Supabase (with elegant local fallback for preview)
      const isPlaceholder = supabase.auth.constructor.name === "Object" || !process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      if (isPlaceholder) {
        // Simulation for testing/preview if Supabase url is placeholder
        console.log("Supabase in placeholder mode. Simulating order creation locally...", orderData);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        orderId = Math.random().toString(36).substring(2, 15);
        
        // Save order to mock localStorage for success page retrieval
        const simulatedOrder = {
          id: orderId,
          ...orderData,
          items: cartItems,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem(`simulated_order_${orderId}`, JSON.stringify(simulatedOrder));
      } else {
        // Real Supabase Insertion
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert(orderData)
          .select()
          .single();

        if (orderError) throw orderError;
        orderId = order.id;

        // Insert Order Items
        const orderItemsData = cartItems.map((item) => ({
          order_id: orderId,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price_at_purchase: item.price,
          item_mode: item.mode,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItemsData);

        if (itemsError) throw itemsError;
      }

      // 3. Clear Cart & Redirect to Success Page
      clearCart();
      router.push(`/checkout/success?id=${orderId}`);
    } catch (error) {
      console.error("Order submission failed:", error);
      alert("حدث خطأ أثناء إتمام الطلب. يرجى المحاولة مرة أخرى.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-12 pb-24">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          
          <h1 className="text-3xl md:text-5xl font-black mb-12 text-right">إتمام الطلب الفاخر</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Form Details (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Form panel */}
              <form onSubmit={handlePlaceOrder} className="glass p-8 rounded-3xl border border-border space-y-6">
                <h2 className="text-2xl font-bold border-b border-border pb-4 mb-6">تفاصيل الشحن والتوصيل</h2>

                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-foreground/80">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: أحمد عبد الله الوداني"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-semibold"
                  />
                </div>

                {/* Phone & City Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-foreground/80">رقم الهاتف *</label>
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
                    <label className="block text-sm font-bold text-foreground/80">المدينة *</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-bold"
                    >
                      <option value="tripoli">طرابلس (10 د.ل)</option>
                      <option value="benghazi">بنغازي (25 د.ل)</option>
                      <option value="misrata">مصراتة (15 د.ل)</option>
                      <option value="khoms">الخمس (15 د.ل)</option>
                      <option value="zawiya">الزاوية (12 د.ل)</option>
                      <option value="sebha">سبها (35 د.ل)</option>
                      <option value="garian">غريان (15 د.ل)</option>
                      <option value="tobruk">طبرق (30 د.ل)</option>
                      <option value="other">مدينة أخرى (25 د.ل)</option>
                    </select>
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-foreground/80">العنوان بالتفصيل *</label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    placeholder="اسم الحي، الشارع، علامة مميزة بجانب المنزل..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface hover:border-primary-light/35 focus:border-primary focus:outline-none transition-colors font-semibold"
                  />
                </div>

                {/* Payment Method selection */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-bold text-foreground">طريقة الدفع</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "cash_on_delivery" ? "border-primary bg-primary/5 text-primary-light font-bold" : "border-border bg-surface hover:bg-surface-hover"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "cash_on_delivery"}
                        onChange={() => setPaymentMethod("cash_on_delivery")}
                        className="accent-primary"
                      />
                      <span>الدفع عند الاستلام</span>
                    </label>

                    <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "sadad" ? "border-primary bg-primary/5 text-primary-light font-bold" : "border-border bg-surface hover:bg-surface-hover"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "sadad"}
                        onChange={() => setPaymentMethod("sadad")}
                        className="accent-primary"
                      />
                      <span>خدمة سداد (Sadad)</span>
                    </label>

                    <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "mobicash" ? "border-primary bg-primary/5 text-primary-light font-bold" : "border-border bg-surface hover:bg-surface-hover"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "mobicash"}
                        onChange={() => setPaymentMethod("mobicash")}
                        className="accent-primary"
                      />
                      <span>موبي كاش (MobiCash)</span>
                    </label>
                  </div>
                </div>

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
                        تأكيد الطلب الفاخر
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Guarantees panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl glass border border-border flex items-center gap-3">
                  <Truck className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">توصيل سريع وموثوق</h4>
                    <p className="text-xs text-foreground/60">لباب بيتك في أسرع وقت</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl glass border border-border flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">معاينة الطلب قبل الدفع</h4>
                    <p className="text-xs text-foreground/60">افحص خاماتك وتأكد منها</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl glass border border-border flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">طرق دفع آمنة 100%</h4>
                    <p className="text-xs text-foreground/60">كاش أو عبر الموبايل المصرفي</p>
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
                    <div key={`${item.id}-${item.mode}`} className="flex gap-4 items-center">
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
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary-light font-medium">
                            {item.mode === "rent" ? "إيجار" : "شراء"}
                          </span>
                          <span className="text-xs text-foreground/60">العدد: {item.quantity}</span>
                        </div>
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

                {/* Price Breakdown */}
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

                  <div className="flex justify-between text-foreground/85">
                    <span>رسوم التوصيل ({cityNames[city]}):</span>
                    <span>{shippingFee} د.ل</span>
                  </div>

                  <div className="flex justify-between items-center text-lg border-t border-border pt-4 font-black">
                    <span className="text-foreground">المجموع الإجمالي:</span>
                    <span className="text-2xl text-primary-light">{finalTotal} د.ل</span>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 text-xs leading-relaxed text-primary-light/90">
                  💡 **ملاحظة تهمك:** كوبون **GRAD2026** يعطيك خصم 10% بمناسبة موسم تخرج 2026! جربه الآن لتوفر على طلبك.
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
