"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle, MapPin, Phone, CreditCard, ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  guest_city: string;
  guest_address: string;
  status: string;
  payment_method: string;
  total_amount: number;
  shipping_fee: number;
  tracking_number: string;
  created_at: string;
  items: OrderItem[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<SimulatedOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    guest_name: "خريج جاغوار الفاخر",
    guest_phone: "0912345678",
    guest_city: "طرابلس",
    guest_address: "حي الأندلس، بجانب مقهى زرياب",
    status: "pending",
    payment_method: "cash_on_delivery",
    total_amount: 95,
    shipping_fee: 10,
    tracking_number: "JG-849302",
    created_at: new Date().toISOString(),
    items: [
      {
        id: "1",
        name: "كاب كويتي فاخر",
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

  return (
    <main className="min-h-screen bg-background pt-16 pb-24 text-right">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        
        {/* Header Celebratory Section */}
        <div className="text-center mb-16 space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Tracking Status & Items (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Order Tracking Progress */}
            <div className="glass p-6 rounded-3xl border border-border space-y-6">
              <h3 className="text-lg font-bold border-b border-border pb-3">حالة الطلب الحالية</h3>
              
              <div className="relative pl-4 space-y-8 before:absolute before:right-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                
                {/* Step 1 */}
                <div className="relative pr-8 flex items-start gap-4">
                  <div className="absolute right-0 top-1 w-7 h-7 rounded-full bg-primary border-4 border-background flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 bg-black rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-primary-light">تم استلام طلبك الفاخر</h4>
                    <p className="text-xs text-foreground/60 mt-1">
                      طلبك قيد المراجعة الآن وسيتواصل معك موظف المبيعات قريباً
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative pr-8 flex items-start gap-4 opacity-50">
                  <div className="absolute right-0 top-1 w-7 h-7 rounded-full bg-border border-4 border-background flex items-center justify-center z-10">
                    <div className="w-2 h-2 bg-foreground/30 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">جاري التجهيز والتعبئة</h4>
                    <p className="text-xs text-foreground/60 mt-1">تجهيز مستلزمات تخرجك وتطريز الأسماء المطلوبة</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative pr-8 flex items-start gap-4 opacity-50">
                  <div className="absolute right-0 top-1 w-7 h-7 rounded-full bg-border border-4 border-background flex items-center justify-center z-10">
                    <div className="w-2 h-2 bg-foreground/30 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">خارج للتوصيل</h4>
                    <p className="text-xs text-foreground/60 mt-1">تم تسليم الشحنة لشركة التوصيل للتواصل معك</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Items List */}
            <div className="glass p-6 rounded-3xl border border-border space-y-4">
              <h3 className="text-lg font-bold border-b border-border pb-3">محتويات الشحنة</h3>
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
              <h3 className="text-lg font-bold border-b border-border pb-3">تفاصيل الفاتورة</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">رقم التتبع للطلب:</span>
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

                <div className="flex justify-between">
                  <span className="text-foreground/60">المجموع النهائي:</span>
                  <span className="font-black text-primary-light">{currentOrder.total_amount} د.ل</span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="glass p-6 rounded-3xl border border-border space-y-4">
              <h3 className="text-lg font-bold border-b border-border pb-3">بيانات التوصيل والدفع</h3>

              <div className="space-y-4 text-sm font-semibold">
                <div className="flex gap-3 items-start">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-foreground/65 text-xs">عنوان التوصيل:</h4>
                    <p className="text-foreground mt-1">
                      {currentOrder.guest_city} · {currentOrder.guest_address}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-foreground/65 text-xs">رقم التواصل:</h4>
                    <p className="text-foreground mt-1" dir="ltr">
                      {currentOrder.guest_phone}
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
