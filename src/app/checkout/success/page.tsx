"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle, MapPin, Phone, CreditCard, ChevronRight, ShoppingBag, MessageCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseSettings } from "@/lib/supabase";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  mode: string;
}

interface SimulatedOrder {
  id: string;
  guest_name: string;
  guest_phone: string;
  guest_backup_phone?: string;
  guest_city: string;
  guest_street: string;
  guest_address_detail?: string;
  status: string;
  payment_method: string;
  total_amount: number;
  tracking_number: string;
  created_at: string;
  items: OrderItem[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<SimulatedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, string>>({});

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
        setOrder(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load order from localStorage", e);
    }
    setLoading(false);
  }, [orderId]);

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
    const rawNumber = settings.whatsapp_number || "+218921234567";
    // Remove plus and spaces for url
    const cleanNumber = rawNumber.replace(/\+/g, "").replace(/\s/g, "");
    
    const itemsList = currentOrder.items
      ? currentOrder.items.map(item => `- ${item.name} (${item.mode === "rent" ? "إيجار" : "شراء"}) [الكمية: ${item.quantity}]`).join("\n")
      : "";

    const message = `السلام عليكم ورحمة الله،
أود تأكيد طلبي رقم (${currentOrder.tracking_number}) من متجر جاغوار للمناسبات.

تفاصيل الطلب:
- اسم الزبون: ${currentOrder.guest_name}
- رقم الهاتف: ${currentOrder.guest_phone}
${currentOrder.guest_backup_phone ? `- هاتف احتياطي: ${currentOrder.guest_backup_phone}\n` : ""}- المدينة: ${currentOrder.guest_city}
- الشارع والعنوان: ${currentOrder.guest_street} ${currentOrder.guest_address_detail || ""}

المنتجات المحجوزة:
${itemsList}

إجمالي القيمة: ${currentOrder.total_amount} د.ل
طريقة الدفع: ${paymentLabels[currentOrder.payment_method] || currentOrder.payment_method}`;

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <main className="min-h-screen bg-background pt-16 pb-24 text-right">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        
        {/* Header Celebratory Section */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
            تهانينا! تم تسجيل طلبك بنجاح
          </h1>
          <p className="text-foreground/60 text-lg max-w-md mx-auto">
            شكراً لاختيارك "جاغوار". يسعدنا أن نكون جزءاً من فرحة تخرجك المميزة!
          </p>
        </div>

        {/* WhatsApp Urgent Action Notice */}
        <div className="glass p-8 rounded-3xl border-2 border-green-500/30 bg-green-950/10 mb-8 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-green-500/20 rounded-full text-green-400">
              <MessageCircle className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-green-400">تأكيد الطلب عبر الواتساب</h2>
            <p className="text-sm font-semibold text-foreground/80 leading-relaxed max-w-xl mx-auto">
              “لتأكيد وإتمام طلبك 100%، يرجى التواصل معنا عبر الواتساب.”
            </p>
            <p className="text-xs text-foreground/60 leading-relaxed">
              قم بالنقر على الزر الأخضر أدناه لفتح محادثة واتساب مجهزة تلقائياً بكامل بيانات فاتورتك لتأكيد حجز منتجاتك فورياً.
            </p>
          </div>
          <div className="flex justify-center">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-600 text-black font-black rounded-xl text-lg transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(34,197,94,0.35)]"
            >
              <MessageCircle className="w-6 h-6" />
              تأكيد حجز الطلبية الآن عبر الواتساب
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Tracking Status & Items (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Order Tracking Progress */}
            <div className="glass p-6 rounded-3xl border border-border space-y-6">
              <h3 className="text-lg font-bold border-b border-border pb-3">حالة الطلب الحالية</h3>
              
              <div className="relative pl-4 space-y-8 before:absolute before:right-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                
                {/* Step 1 - active */}
                <div className="relative pr-8 flex items-start gap-4">
                  <div className="absolute right-0 top-1 w-7 h-7 rounded-full bg-primary border-4 border-background flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 bg-black rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-primary-light">طلب جديد (بانتظار التأكيد)</h4>
                    <p className="text-xs text-foreground/60 mt-1">
                      تم تسجيل طلبك بنجاح، يرجى نقر زر الواتساب أعلاه لتأكيد طلبك وتجنب إلغائه تلقائياً.
                    </p>
                  </div>
                </div>

                {/* Step 2 - inactive */}
                <div className="relative pr-8 flex items-start gap-4 opacity-50">
                  <div className="absolute right-0 top-1 w-7 h-7 rounded-full bg-border border-4 border-background flex items-center justify-center z-10">
                    <div className="w-2 h-2 bg-foreground/30 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">جاري التجهيز والتطريز</h4>
                    <p className="text-xs text-foreground/60 mt-1">تجهيز مستلزمات تخرجك وتطريز الأسماء وكتابة التفاصيل بدقة</p>
                  </div>
                </div>

                {/* Step 3 - inactive */}
                <div className="relative pr-8 flex items-start gap-4 opacity-50">
                  <div className="absolute right-0 top-1 w-7 h-7 rounded-full bg-border border-4 border-background flex items-center justify-center z-10">
                    <div className="w-2 h-2 bg-foreground/30 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">جاهز للتسليم / التوصيل</h4>
                    <p className="text-xs text-foreground/60 mt-1">طلبك جاهز للتسليم في فروعنا أو للشحن مباشرة</p>
                  </div>
                </div>

              </div>
            </div>

            {currentOrder.items?.some(item => item.mode === "rent") && settings.rental_policy && (
              <div className="glass p-6 rounded-3xl border border-primary/20 bg-primary/5 space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  <span>تذكير هام بخصوص سياسة الاستئجار:</span>
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
                  <div key={`${item.id}-${item.mode}`} className="flex gap-4 items-center">
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
                        <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary-light font-medium">
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
            </div>

          </div>

          {/* Order Summary & Customer details (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Order Metadata */}
            <div className="glass p-6 rounded-3xl border border-border space-y-4">
              <h3 className="text-lg font-bold border-b border-border pb-3">ملخص الفاتورة</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">رقم تتبع الطلب:</span>
                  <span className="font-black text-primary-light tracking-wide">{currentOrder.tracking_number}</span>
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

                <div className="flex justify-between items-center border-t border-border pt-3">
                  <span className="text-foreground/60">إجمالي قيمة الطلب:</span>
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
                      {currentOrder.guest_city} · {currentOrder.guest_street}
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
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-4 pt-4">
              <Link href="/products" className="btn-premium w-full py-4 text-center text-sm font-bold flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                مواصلة التسوق
              </Link>
              <Link
                href="/"
                className="w-full py-4 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-colors font-bold text-sm flex items-center justify-center gap-1"
              >
                الرجوع للرئيسية
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
