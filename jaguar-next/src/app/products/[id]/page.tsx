"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { ShoppingCart, Heart, ShieldCheck, Truck, ChevronRight, Plus, Minus, Check } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

// Mock products database for details fetching
const productsDb: Record<string, {
  name: string;
  priceSale: number;
  priceRent: number;
  description: string;
  image: string;
  status: string;
  category: string;
  categoryId: string;
  code: string;
}> = {
  "1": {
    name: "كاب كويتي فاخر",
    priceSale: 85,
    priceRent: 40,
    description: "كاب تخرج بتصميم كويتي أصيل، مصنوع من أجود أنواع المخمل الفاخر. يتميز بتفاصيل ذهبية دقيقة وحياكة يدوية متقنة تضمن لك إطلالة استثنائية في يوم تخرجك. متوفر للبيع والإيجار.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-001",
  },
  "2": {
    name: "شال تخرج مطرز",
    priceSale: 45,
    priceRent: 20,
    description: "شال تخرج مطرز بخيوط حريرية فاخرة. يمكنك طلب كتابة اسمك وسنة التخرج بألوان متعددة. نسيج ناعم ومقاوم للتجعد.",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800&auto=format&fit=crop",
    status: "متوفر",
    category: "شالات التخرج",
    categoryId: "sashes",
    code: "JG-002",
  },
  "3": {
    name: "بروش مخصص",
    priceSale: 25,
    priceRent: 12,
    description: "بروش تخرج معدني أنيق ومطلي بالذهب عيار 18 قيراط. يتم قصه بالليزر بالاسم أو الشعار الذي تفضله. هدية تذكارية رائعة.",
    image: "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?q=80&w=800&auto=format&fit=crop",
    status: "محجوز",
    category: "بروشات التخرج",
    categoryId: "pins",
    code: "JG-003",
  },
  "4": {
    name: "روب تخرج أطفال",
    priceSale: 60,
    priceRent: 30,
    description: "روب تخرج للأطفال بتصميم مريح وألوان زاهية تناسب حفلات تخرج الروضة والابتدائي. خامة خفيفة وباردة تناسب الصيف.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-004",
  },
  "5": {
    name: "طقم كاب وشال",
    priceSale: 120,
    priceRent: 55,
    description: "طقم تخرج ملكي متكامل يشمل الكاب الكويتي الفاخر مع شال مطرز مخصص بالاسم. وفر أكثر مع هذا الطقم المميز.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-005",
  },
  "6": {
    name: "قبعة تخرج مخمل",
    priceSale: 95,
    priceRent: 45,
    description: "قبعة تخرج كلاسيكية مصنوعة من القطيفة الفاخرة مع شراشيب حريرية طويلة متدلية بلون ذهبي لامع.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
    status: "غير متوفر",
    category: "قبعات التخرج",
    categoryId: "caps",
    code: "JG-006",
  },
};

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const product = productsDb[params.id] || productsDb["1"]; // fallback to 1
  
  const [mode, setMode] = useState<"rent" | "sale">("sale");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

  const currentPrice = mode === "sale" ? product.priceSale : product.priceRent;

  const handleAddToCart = () => {
    addToCart(
      {
        id: params.id,
        name: product.name,
        price: currentPrice,
        image: product.image,
        mode: mode,
      },
      quantity
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-8 pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-8 font-medium overflow-x-auto pb-2">
            <Link href="/" className="hover:text-primary whitespace-nowrap">الرئيسية</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link href="/products" className="hover:text-primary whitespace-nowrap">المنتجات</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link href={`/categories/${product.categoryId}`} className="hover:text-primary whitespace-nowrap">{product.category}</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="text-primary whitespace-nowrap">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Product Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden glass border border-border">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-6">
                <span className="text-primary-light text-sm font-bold mb-2 block">{product.category} · {product.code}</span>
                <h1 className="text-3xl md:text-5xl font-black mb-4">{product.name}</h1>
                
                {/* Price display with mode explanation */}
                <div className="flex items-baseline gap-4 mt-2">
                  <div className="text-4xl font-black text-primary-light">
                    {currentPrice} <span className="text-xl font-normal">د.ل</span>
                  </div>
                  <span className="text-foreground/50 text-sm">
                    ({mode === "sale" ? "سعر الشراء النهائي" : "سعر الإيجار للمناسبة"})
                  </span>
                </div>
              </div>

              <p className="text-foreground/70 text-lg leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Status Badge */}
              <div className="mb-8 flex items-center gap-4">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
                  product.status === "متوفر" ? "bg-green-500/10 text-green-400 border border-green-500/20" : 
                  product.status === "محجوز" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : 
                  "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                  {product.status}
                </span>
              </div>

              {/* Service Selection (Rent vs Buy Toggle) */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-foreground/60 mb-3">اختر نوع الخدمة:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMode("sale")}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      mode === "sale"
                        ? "border-primary bg-primary/10 text-primary-light font-black"
                        : "border-border bg-surface hover:bg-surface-hover text-foreground/80"
                    }`}
                  >
                    <div className="text-lg">شراء ملكية</div>
                    <div className="text-xs opacity-80 mt-1">{product.priceSale} د.ل</div>
                  </button>
                  <button
                    onClick={() => setMode("rent")}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      mode === "rent"
                        ? "border-primary bg-primary/10 text-primary-light font-black"
                        : "border-border bg-surface hover:bg-surface-hover text-foreground/80"
                    }`}
                  >
                    <div className="text-lg">إيجار للمناسبة</div>
                    <div className="text-xs opacity-80 mt-1">{product.priceRent} د.ل</div>
                  </button>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-foreground/60 mb-3">الكمية:</h3>
                <div className="flex items-center w-36 border border-border rounded-xl bg-surface overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-3 hover:bg-surface-hover text-foreground/60 hover:text-foreground transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-3 hover:bg-surface-hover text-foreground/60 hover:text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={handleAddToCart}
                  disabled={product.status === "غير متوفر"}
                  className={`flex-1 btn-premium text-lg py-4 gap-2 ${
                    product.status === "غير متوفر" ? "opacity-50 cursor-not-allowed bg-border" : ""
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-5 h-5" />
                      تمت الإضافة للسلة!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      {product.status === "غير متوفر" ? "نفذت الكمية" : "إضافة للسلة"}
                    </>
                  )}
                </button>
                <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-primary/50 text-foreground transition-all duration-300 font-bold">
                  <Heart className="w-5 h-5" />
                  حفظ
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface rounded-lg border border-border">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground/80">توصيل سريع لكل المدن</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface rounded-lg border border-border">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground/80">خامات أصلية مضمونة</span>
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
