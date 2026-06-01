"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { ShoppingCart, Heart, ShieldCheck, Truck, ChevronRight, Plus, Minus, Check, Star, Send } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getSupabaseProducts } from "@/lib/supabase";

// Products database for details fetching
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
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج بتصميم كويتي أصيل مع شال مطرز بالاسم بخط عربي ذهبي فاخر. مصنوع من أجود أنواع الساتان والمخمل الأسود مع تفاصيل ذهبية وشراشيب حريرية. يشمل القبعة والشال. متوفر للبيع والإيجار.",
    image: "/products/kuwaiti-cap-1.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-001",
  },
  "2": {
    name: "كاب تخرج مع باقة ورد",
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج كويتي أنيق مع شال مطرز بالذهبي. تصميم عصري يناسب جميع المناسبات الأكاديمية. خامة ساتان فاخرة مع حياكة متقنة وتفاصيل ذهبية.",
    image: "/products/kuwaiti-cap-2.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-002",
  },
  "3": {
    name: "كاب تخرج مع شال أحمر",
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج فاخر بقبعة بوردو مميزة وشال أحمر مطرز بخط عربي ذهبي. تصميم فريد يجمع بين الأناقة والتميز. مناسب لحفلات التخرج الجامعية.",
    image: "/products/kuwaiti-cap-3.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-003",
  },
  "4": {
    name: "كاب كويتي كلاسيك Class 2026",
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج كويتي كلاسيكي من المخمل الأسود الفاخر مع شال مطرز يحمل عبارة Class 2026 بخط ذهبي أنيق. تصميم فخم يليق بلحظة التخرج المميزة.",
    image: "/products/kuwaiti-cap-4.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-004",
  },
  "5": {
    name: "كاب تخرج مع باقة زهور",
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج أنيق بتصميم كويتي مع شال مطرز بالذهبي ورقم السنة. إطلالة راقية ومثالية لتصوير لحظات التخرج الخالدة.",
    image: "/products/kuwaiti-cap-5.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-005",
  },
  "6": {
    name: "طقم تخرج جماعي - شال ذهبي",
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج مع شال ذهبي فاخر مطرز بالاسم. مثالي للطلب الجماعي لمجموعات التخرج. خصم خاص على الطلبات الجماعية (5 قطع فأكثر).",
    image: "/products/kuwaiti-cap-6.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-006",
  },
  "7": {
    name: "كاب تخرج مع بالون ذهبي",
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج كويتي من المخمل الأسود مع شال مطرز. تصميم عصري وأنيق مع إكسسوارات التخرج. يشمل القبعة والشال والشراشيب الذهبية.",
    image: "/products/kuwaiti-cap-7.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-007",
  },
  "8": {
    name: "كاب تخرج احتفالي",
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج كويتي فاخر من المخمل الأسود الممتاز. مثالي للحظات الاحتفالية المميزة. تطريز يدوي بخيوط ذهبية فاخرة مع شراشيب حريرية.",
    image: "/products/kuwaiti-cap-8.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-008",
  },
  "9": {
    name: "شال تخرج مطرز",
    priceSale: 45,
    priceRent: 20,
    description: "شال تخرج مطرز بخيوط حريرية فاخرة. يمكنك طلب كتابة اسمك وسنة التخرج بألوان متعددة. نسيج ناعم ومقاوم للتجعد.",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800&auto=format&fit=crop",
    status: "متوفر",
    category: "شالات التخرج",
    categoryId: "sashes",
    code: "JG-009",
  },
  "10": {
    name: "بروش مخصص",
    priceSale: 25,
    priceRent: 12,
    description: "بروش تخرج معدني أنيق ومطلي بالذهب عيار 18 قيراط. يتم قصه بالليزر بالاسم أو الشعار الذي تفضله. هدية تذكارية رائعة.",
    image: "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?q=80&w=800&auto=format&fit=crop",
    status: "محجوز",
    category: "بروشات التخرج",
    categoryId: "pins",
    code: "JG-010",
  },
  "11": {
    name: "روب تخرج أطفال",
    priceSale: 60,
    priceRent: 30,
    description: "روب تخرج للأطفال بتصميم مريح وألوان زاهية تناسب حفلات تخرج الروضة والابتدائي. خامة خفيفة وباردة تناسب الصيف.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-011",
  },
  "12": {
    name: "قبعة تخرج مخمل",
    priceSale: 95,
    priceRent: 45,
    description: "قبعة تخرج كلاسيكية مصنوعة من القطيفة الفاخرة مع شراشيب حريرية طويلة متدلية بلون ذهبي لامع.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
    status: "غير متوفر",
    category: "قبعات التخرج",
    categoryId: "caps",
    code: "JG-012",
  }
};

export default function ProductDetailClient({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(productsDb[params.id] || productsDb["1"]);
  const [mode, setMode] = useState<"rent" | "sale">("sale");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Reviews State
  interface Review { name: string; rating: number; comment: string; date: string; }
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    // Load reviews from localStorage
    const storedReviews = localStorage.getItem(`jaguar_reviews_${params.id}`);
    if (storedReviews) setReviews(JSON.parse(storedReviews));
  }, [params.id]);

  useEffect(() => {
    getSupabaseProducts().then(dbProducts => {
      const found = dbProducts.find(p => p.id === params.id);
      if (found) {
        setProduct(found);
      }
    }).catch(err => console.error("Error fetching product detail in PD:", err));
  }, [params.id]);

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

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    const newReview: Review = {
      name: reviewName,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toLocaleDateString("ar-LY"),
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`jaguar_reviews_${params.id}`, JSON.stringify(updated));
    setReviewName("");
    setReviewComment("");
    setReviewRating(5);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

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
                <button
                  onClick={() => {
                    if (isInWishlist(params.id)) {
                      removeFromWishlist(params.id);
                    } else {
                      addToWishlist({ id: params.id, name: product.name, price: product.priceSale, image: product.image });
                    }
                  }}
                  className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl border transition-all duration-300 font-bold ${
                    isInWishlist(params.id)
                      ? "border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "border-border bg-surface hover:bg-surface-hover hover:border-primary/50 text-foreground"
                  }`}
                >
                  <Heart className="w-5 h-5" fill={isInWishlist(params.id) ? "currentColor" : "none"} />
                  {isInWishlist(params.id) ? "في المفضلة" : "حفظ"}
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

          {/* ===== REVIEWS SECTION ===== */}
          <div className="mt-20 border-t border-border pt-12">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black mb-1">آراء العملاء</h2>
                {avgRating ? (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className="w-5 h-5" fill={s <= Math.round(Number(avgRating)) ? "#c9a84c" : "none"} stroke="#c9a84c" />
                      ))}
                    </div>
                    <span className="text-primary-light font-bold text-lg">{avgRating}</span>
                    <span className="text-foreground/50 text-sm">({reviews.length} تقييم)</span>
                  </div>
                ) : (
                  <p className="text-foreground/50">لا توجد تقييمات بعد — كن أول من يقيّم!</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Review Form */}
              <div className="glass rounded-2xl border border-border p-6">
                <h3 className="text-xl font-bold mb-5">أضف تقييمك</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground/70 mb-2">اسمك *</label>
                    <input
                      type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="أدخل اسمك"
                      required
                      className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground/70 mb-2">تقييمك *</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <button
                          key={s}
                          type="button"
                          onMouseEnter={() => setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setReviewRating(s)}
                        >
                          <Star
                            className="w-8 h-8 transition-colors"
                            fill={s <= (hoverRating || reviewRating) ? "#c9a84c" : "none"}
                            stroke="#c9a84c"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground/70 mb-2">تعليقك *</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="شاركنا رأيك في المنتج..."
                      required
                      rows={3}
                      className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                  <button type="submit" className="w-full btn-premium flex items-center justify-center gap-2">
                    {reviewSubmitted ? (
                      <><Check className="w-5 h-5" /> شكراً على تقييمك!</>
                    ) : (
                      <><Send className="w-5 h-5" /> إرسال التقييم</>
                    )}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pl-2">
                {reviews.length === 0 ? (
                  <div className="glass rounded-2xl border border-border p-8 text-center text-foreground/50">
                    <Star className="w-12 h-12 mx-auto mb-3 text-foreground/20" />
                    <p>لا توجد تقييمات بعد</p>
                  </div>
                ) : (
                  reviews.map((rev, idx) => (
                    <div key={idx} className="glass rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary-light flex items-center justify-center font-black text-sm">
                            {rev.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{rev.name}</p>
                            <p className="text-foreground/40 text-xs">{rev.date}</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className="w-4 h-4" fill={s <= rev.rating ? "#c9a84c" : "none"} stroke="#c9a84c" />
                          ))}
                        </div>
                      </div>
                      <p className="text-foreground/70 text-sm leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
