"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { ShoppingCart, Heart, ShieldCheck, Truck, ChevronLeft, ChevronRight, Plus, Minus, Check, X, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getSupabaseProducts, resolveAssetPath, getSupabaseSettings, getSupabaseCategories, getSupabaseSubcategories } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

// Mock products database for details fetching fallback
const productsDb: Record<string, {
  name: string;
  priceSale: number;
  priceRent: number;
  description: string;
  image: string;
  images?: string[];
  status: string;
  category: string;
  categoryId: string;
  code: string;
}> = {
  "1": {
    name: "كاب كويتي",
    priceSale: 85,
    priceRent: 40,
    description: "كاب تخرج بتصميم كويتي أصيل، مصنوع من أجود أنواع المخمل. يتميز بتفاصيل ذهبية دقيقة وحياكة يدوية متقنة تضمن لك إطلالة استثنائية في يوم تخرجك. متوفر للبيع والإيجار.",
    image: resolveAssetPath("/products/gallery/graduation_photo_01.jpg"),
    images: [
      resolveAssetPath("/products/gallery/graduation_photo_01.jpg"),
      resolveAssetPath("/products/gallery/graduation_photo_02.jpg"),
      resolveAssetPath("/products/gallery/graduation_photo_03.jpg"),
      resolveAssetPath("/products/gallery/graduation_photo_04.jpg"),
      resolveAssetPath("/products/gallery/graduation_photo_05.jpg"),
      resolveAssetPath("/products/gallery/graduation_photo_06.jpg"),
      resolveAssetPath("/products/gallery/graduation_photo_07.jpg"),
      resolveAssetPath("/products/gallery/graduation_photo_08.jpg"),
    ],
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-001",
  },
  "2": {
    name: "شال تخرج مطرز",
    priceSale: 45,
    priceRent: 20,
    description: "شال تخرج مطرز بخيوط حريرية. يمكنك طلب كتابة اسمك وسنة التخرج بألوان متعددة. نسيج ناعم ومقاوم للتجعد.",
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
    description: "طقم تخرج ملكي متكامل يشمل الكاب الكويتي مع شال مطرز مخصص بالاسم. وفر أكثر مع هذا الطقم المميز.",
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
    description: "قبعة تخرج كلاسيكية مصنوعة من القطيفة مع شراشيب حريرية طويلة متدلية بلون ذهبي لامع.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
    status: "غير متوفر",
    category: "قبعات التخرج",
    categoryId: "caps",
    code: "JG-006",
  },
};

const getArabicStatusLabel = (status: string) => {
  const s = (status || "").toLowerCase().trim();
  if (s === "available" || s === "متوفر") return "متوفر";
  if (s === "unavailable" || s === "غير متوفر" || s === "غير متوفر حالياً") return "غير متوفر";
  if (s === "reserved" || s === "محجوز") return "محجوز";
  if (s === "sold" || s === "مباع") return "مباع";
  if (s === "hidden" || s === "مخفي") return "مخفي";
  return status;
};

export default function ProductDetailClient() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id") || "1";

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<"rent" | "sale">("sale");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const { addToCart } = useCart();

  // Sash Customization states
  const [sashColor, setSashColor] = useState<string>("أسود");
  const [customSashColor, setCustomSashColor] = useState<string>("");
  const [textColor, setTextColor] = useState<string>("ذهبي");
  const [customText, setCustomText] = useState<string>("");
  const [isEdged, setIsEdged] = useState<boolean>(false);

  // Scheduling states
  const [pickupDate, setPickupDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [isPreliminary, setIsPreliminary] = useState<boolean>(true); // default to true (first ready) for sale

  const [validationError, setValidationError] = useState<string>("");

  useEffect(() => {
    getSupabaseSettings().then(setSettings).catch(err => console.error("Error fetching settings in PD:", err));
    getSupabaseCategories().then(setCategories).catch(err => console.error("Error fetching categories in PD:", err));
    getSupabaseSubcategories().then(setSubcategories).catch(err => console.error("Error fetching subcategories in PD:", err));
  }, []);

  // Gallery state
  const productImages = (product?.images && product.images.length > 0 ? product.images : [product?.image || ""])
    .filter(Boolean)
    .map((img: string) => resolveAssetPath(img));
  const [activeImage, setActiveImage] = useState("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setImageLoading(true);
  }, [activeImage]);

  // Listen for keyboard arrows to switch lightbox photos
  useEffect(() => {
    if (!isLightboxOpen || productImages.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeIdx = productImages.indexOf(activeImage);
      if (activeIdx === -1) return;

      if (e.key === "ArrowRight") {
        const nextIdx = (activeIdx + 1) % productImages.length;
        setActiveImage(productImages[nextIdx]);
      } else if (e.key === "ArrowLeft") {
        const prevIdx = (activeIdx - 1 + productImages.length) % productImages.length;
        setActiveImage(productImages[prevIdx]);
      } else if (e.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, activeImage, productImages]);

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setProduct(null);
    setError(false);
    setActiveImage("");

    getSupabaseProducts().then(dbProducts => {
      if (!isCurrent) return;
      
      const found = dbProducts.find(p => p.id === productId);
      if (found) {
        const dbProduct: any = found;
        if (!dbProduct.images) {
          if (dbProduct.id === "1" && productsDb["1"].images) {
             dbProduct.images = productsDb["1"].images;
          }
        }
        setProduct(dbProduct);

        // Auto select mode based on availability and price > 0
        const isSale = (dbProduct.itemMode === 'sale' || dbProduct.itemMode === 'both') && dbProduct.priceSale > 0;
        const isRent = (dbProduct.itemMode === 'rent' || dbProduct.itemMode === 'both') && dbProduct.priceRent > 0;
        if (!isSale && isRent) {
          setMode("rent");
        } else {
          setMode("sale");
        }

        const imagesList = dbProduct.images && dbProduct.images.length > 0 ? dbProduct.images : [dbProduct.image];
        setActiveImage(resolveAssetPath(imagesList[0]));
        setLoading(false);
      } else {
        // Try mock databases as fallback if ID exists in local mock database
        const mockFound = productsDb[productId];
        if (mockFound) {
          const fallbackProduct = { id: productId, ...mockFound };
          setProduct(fallbackProduct);
          setMode(mockFound.priceRent > 0 && mockFound.priceSale === 0 ? "rent" : "sale");
          const imagesList = mockFound.images && mockFound.images.length > 0 ? mockFound.images : [mockFound.image];
          setActiveImage(resolveAssetPath(imagesList[0]));
          setLoading(false);
        } else {
          setError(true);
          setLoading(false);
        }
      }
    }).catch(err => {
      console.error("Error fetching product detail in PD:", err);
      if (isCurrent) {
        setError(true);
        setLoading(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [productId]);

  const isSash = product ? (
    product.categoryId === "sashes" || 
    (product.category && product.category.includes("شال")) || 
    (product.name && product.name.includes("شال"))
  ) : false;

  const finalPrice = product ? (mode === "sale" ? product.priceSale : product.priceRent) : 0;

  const getWhatsAppCustomizationLink = () => {
    const rawNumber = settings.whatsapp_number || "218921544663";
    const cleanNumber = rawNumber.replace(/\+/g, "").replace(/\s/g, "");
    
    const nameLower = ((product?.name || "") + " " + (product?.category || "")).toLowerCase();
    const sashLayers = (nameLower.includes("ثلاثي") || nameLower.includes("ثلاثية")) ? "ثلاثي الطبقات" : "ثنائي الطبقات";
    const writeMethod = nameLower.includes("تطريز") ? "تطريز" : (nameLower.includes("طباعة") ? "طباعة" : "تطريز/طباعة");
    
    let message = `مرحباً، أود تفصيل شال تخرج:\n`;
    message += `- الموديل: ${product?.name || ""}\n`;
    message += `- عدد الطبقات: ${sashLayers}\n`;
    message += `- طريقة الكتابة: ${writeMethod}\n\n`;
    message += `📋 تفاصيل الطلب:\n`;
    message += `* الاسم (الجهة الأولى): _________\n`;
    message += `* الجهة الأخرى: _________\n`;
    message += `* لون قماش الشال: _________\n`;
    message += `* لون ال${writeMethod}: _________\n`;
    message += `* الحواف (الكنار): _________ (مثال: مع حواف أو بدون حواف)\n`;
    message += `* تفاصيل أو ملاحظات أخرى: _________\n`;
    
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    setValidationError("");

    // Validate pickup date if not preliminary
    if (!isPreliminary && mode === "sale" && !pickupDate) {
      setValidationError("الرجاء تحديد تاريخ الاستلام المفضل.");
      return;
    }
    if (mode === "rent" && (!pickupDate || !returnDate)) {
      setValidationError("الرجاء تحديد تواريخ الاستلام والإرجاع للإيجار.");
      return;
    }

    addToCart(
      {
        id: productId,
        name: product.name,
        price: finalPrice,
        image: product.image,
        mode: mode,
        customization_type: undefined,
        layer_type: undefined,
        color_sash: undefined,
        color_text: undefined,
        custom_text: undefined,
        is_edged: undefined,
        pickup_date: mode === "rent" ? pickupDate : (isPreliminary ? undefined : pickupDate),
        return_date: mode === "rent" ? returnDate : undefined,
        is_preliminary: mode === "sale" ? isPreliminary : false,
      },
      quantity
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-8 pb-24 text-right">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Shimmer Breadcrumbs */}
            <div className="flex gap-2 mb-8 animate-pulse justify-end">
              <div className="h-4 bg-surface-hover/50 rounded w-20"></div>
              <div className="h-4 bg-surface-hover/30 rounded w-4"></div>
              <div className="h-4 bg-surface-hover/50 rounded w-24"></div>
              <div className="h-4 bg-surface-hover/30 rounded w-4"></div>
              <div className="h-4 bg-surface-hover/50 rounded w-32"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Shimmer Gallery */}
              <div className="space-y-4 animate-pulse">
                <div className="aspect-square w-full rounded-2xl bg-surface-hover/40 border border-border"></div>
                <div className="flex gap-4 justify-end">
                  <div className="w-24 h-24 rounded-xl bg-surface-hover/30"></div>
                  <div className="w-24 h-24 rounded-xl bg-surface-hover/30"></div>
                  <div className="w-24 h-24 rounded-xl bg-surface-hover/30"></div>
                </div>
              </div>

              {/* Shimmer Info */}
              <div className="space-y-6 animate-pulse flex flex-col items-end text-right">
                <div className="h-4 bg-surface-hover/50 rounded w-1/4"></div>
                <div className="h-12 bg-surface-hover/70 rounded w-3/4"></div>
                <div className="h-6 bg-surface-hover/50 rounded w-1/3"></div>
                <div className="h-20 bg-surface-hover/30 rounded w-full"></div>
                <div className="h-10 bg-surface-hover/50 rounded w-1/2"></div>
                <div className="h-14 bg-surface-hover/70 rounded w-full"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-24 flex items-center justify-center text-center">
          <div className="max-w-md p-8 glass rounded-2xl border border-border">
            <h1 className="text-3xl font-black text-red-500 mb-4">المنتج غير موجود</h1>
            <p className="text-foreground/70 mb-8 font-bold">عذراً، لم نتمكن من العثور على المنتج المطلوب أو قد يكون تم حذفه.</p>
            <Link href="/categories" className="btn-premium px-8 py-3">تصفح الأقسام</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Resolve main category and subcategory details dynamically for breadcrumbs
  const mainCategoryObj = product ? categories.find(c => c.id === product.categoryId || c.slug === product.categoryId) : null;
  const mainCategoryName = mainCategoryObj ? mainCategoryObj.name : (product?.category || "القسم");
  const mainCategorySlug = mainCategoryObj ? mainCategoryObj.id : (product?.categoryId || "");

  const subcategoryObj = product && product.subcategoryId ? subcategories.find(s => s.id === product.subcategoryId) : null;
  const subcategoryName = subcategoryObj ? subcategoryObj.name : null;
  const subcategoryId = subcategoryObj ? subcategoryObj.id : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-8 pb-24 text-right">
        <div className="container mx-auto px-4 lg:px-8">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-8 font-medium overflow-x-auto pb-2">
            <Link href="/" className="hover:text-primary whitespace-nowrap">الرئيسية</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link href="/categories" className="hover:text-primary whitespace-nowrap">الأقسام</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link href={`/categories/${mainCategorySlug}`} className="hover:text-primary whitespace-nowrap">{mainCategoryName}</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            {subcategoryName && (
              <>
                <Link href={`/categories/${mainCategorySlug}?sub=${subcategoryId}`} className="hover:text-primary whitespace-nowrap">{subcategoryName}</Link>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </>
            )}
            <span className="text-primary whitespace-nowrap">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Product Image Gallery */}
            <div className="space-y-4">
              <div 
                className="relative aspect-square w-full rounded-2xl overflow-hidden glass border border-border cursor-pointer group"
                onClick={() => setIsLightboxOpen(true)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={activeImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      priority
                      onLoad={() => setImageLoading(false)}
                    />
                    {imageLoading && (
                      <div className="absolute inset-0 bg-surface-hover animate-pulse flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                {/* Overlay hint for Lightbox */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                  <span className="text-white font-bold text-lg bg-black/50 px-6 py-3 rounded-full backdrop-blur-sm">
                    انقر للتكبير
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x hide-scrollbar">
                  {productImages.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-start ${
                        activeImage === img ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} - ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-6">
                <span className="text-primary-light text-sm font-bold mb-2 block">{product.category} · {product.code}</span>
                <h1 className="text-3xl md:text-5xl font-black mb-4">{product.name}</h1>
                
                {/* Price display with mode explanation */}
                <div className="flex items-baseline gap-4 mt-2">
                  {(() => {
                    const isSaleAvailable = (product.itemMode === "sale" || product.itemMode === "both") && product.priceSale > 0;
                    const isRentAvailable = (product.itemMode === "rent" || product.itemMode === "both") && product.priceRent > 0;
                    const isUnavailableOrSoldOrHidden =
                      product.statusKey === "unavailable" ||
                      product.statusKey === "sold" ||
                      product.statusKey === "hidden" ||
                      product.status === "غير متوفر" ||
                      product.status === "مباع" ||
                      product.status === "مخفي";

                    if (isUnavailableOrSoldOrHidden) {
                      return <div className="text-4xl font-black text-red-500">غير متوفر حالياً</div>;
                    }
                    if (mode === "sale") {
                      return isSaleAvailable ? (
                        <div className="text-4xl font-black text-primary-light">
                          {finalPrice} <span className="text-xl font-normal">د.ل</span>
                        </div>
                      ) : (
                        <div className="text-4xl font-black text-red-500">غير متوفر للبيع</div>
                      );
                    } else {
                      return isRentAvailable ? (
                        <div className="text-4xl font-black text-primary-light">
                          {finalPrice} <span className="text-xl font-normal">د.ل</span>
                        </div>
                      ) : (
                        <div className="text-4xl font-black text-red-500">غير متوفر للإيجار</div>
                      );
                    }
                  })()}
                  {(() => {
                    const isSaleAvailable = (product.itemMode === "sale" || product.itemMode === "both") && product.priceSale > 0;
                    const isRentAvailable = (product.itemMode === "rent" || product.itemMode === "both") && product.priceRent > 0;
                    const isUnavailableOrSoldOrHidden =
                      product.statusKey === "unavailable" ||
                      product.statusKey === "sold" ||
                      product.statusKey === "hidden" ||
                      product.status === "غير متوفر" ||
                      product.status === "مباع" ||
                      product.status === "مخفي";

                    return !isUnavailableOrSoldOrHidden && (mode === "sale" ? isSaleAvailable : isRentAvailable) && (
                      <span className="text-foreground/50 text-sm">
                        ({mode === "sale" ? "سعر الشراء النهائي" : "سعر الإيجار للمناسبة"})
                      </span>
                    );
                  })()}
                </div>
              </div>

              <p className="text-foreground/70 text-lg leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Status Badge */}
              <div className="mb-8 flex items-center gap-4">
                {(() => {
                  const isUnavailableOrSoldOrHidden =
                    product.statusKey === "unavailable" ||
                    product.statusKey === "sold" ||
                    product.statusKey === "hidden" ||
                    product.status === "غير متوفر" ||
                    product.status === "مباع" ||
                    product.status === "مخفي";

                  const cleanStatus = getArabicStatusLabel(product.status);

                  return (
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
                      isUnavailableOrSoldOrHidden
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : cleanStatus === "محجوز" || product.statusKey === "reserved"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-green-500/10 text-green-400 border border-green-500/20"
                    }`}>
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                      {isUnavailableOrSoldOrHidden ? "غير متوفر حالياً" : cleanStatus}
                    </span>
                  );
                })()}
              </div>

              {/* Service Selection (Rent vs Buy Toggle) */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-foreground/60 mb-3">اختر نوع الخدمة:</h3>
                {(() => {
                  const isSaleAvailable = (product.itemMode === "sale" || product.itemMode === "both") && product.priceSale > 0;
                  const isRentAvailable = (product.itemMode === "rent" || product.itemMode === "both") && product.priceRent > 0;
                  const isUnavailableOrSoldOrHidden =
                    product.statusKey === "unavailable" ||
                    product.statusKey === "sold" ||
                    product.statusKey === "hidden" ||
                    product.status === "غير متوفر" ||
                    product.status === "مباع" ||
                    product.status === "مخفي";

                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        disabled={!isSaleAvailable || isUnavailableOrSoldOrHidden}
                        onClick={() => setMode("sale")}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          !isSaleAvailable || isUnavailableOrSoldOrHidden
                            ? "border-border/30 bg-surface/30 text-foreground/30 cursor-not-allowed opacity-50 font-bold"
                            : mode === "sale"
                            ? "border-primary bg-primary/10 text-primary-light font-black"
                            : "border-border bg-surface hover:bg-surface-hover text-foreground/80 font-bold"
                        }`}
                      >
                        <div className="text-lg font-bold">شراء ملكية</div>
                        <div className="text-xs opacity-80 mt-1">
                          {isSaleAvailable ? `${product.priceSale} د.ل` : "غير متوفر للبيع"}
                        </div>
                      </button>
                      <button
                        disabled={!isRentAvailable || isUnavailableOrSoldOrHidden}
                        onClick={() => setMode("rent")}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          !isRentAvailable || isUnavailableOrSoldOrHidden
                            ? "border-border/30 bg-surface/30 text-foreground/30 cursor-not-allowed opacity-50 font-bold"
                            : mode === "rent"
                            ? "border-primary bg-primary/10 text-primary-light font-black"
                            : "border-border bg-surface hover:bg-surface-hover text-foreground/80 font-bold"
                        }`}
                      >
                        <div className="text-lg font-bold">إيجار للمناسبة</div>
                        <div className="text-xs opacity-80 mt-1">
                          {isRentAvailable ? `${product.priceRent} د.ل` : "غير متوفر للإيجار"}
                        </div>
                      </button>
                    </div>
                  );
                })()}

                {mode === "rent" && settings.rental_policy && (
                  <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2 text-right animate-fadeIn">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                       <ShieldCheck className="w-4 h-4 text-primary" />
                       <span>سياسة الإيجار</span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                      {settings.rental_policy}
                    </p>
                  </div>
                )}
              </div>

              {/* Sash Customizations (if applicable) */}
              {isSash && (
                <div className="mb-8 p-6 rounded-2xl glass-premium border border-primary/20 space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-2 text-primary font-bold text-lg border-b border-border pb-3">
                    <span>🎨 تنسيق وتفصيل الشال</span>
                  </div>

                  <p className="text-xs text-foreground/80 leading-relaxed">
                    لتحديد الاسم، لون القماش، لون التطريز/الطباعة، الحواف، وكافة تفاصيل الشال المفضلة لديك، يرجى الضغط على الزر أدناه للتواصل والتنسيق مباشرة معنا عبر الواتساب:
                  </p>

                  {/* WhatsApp Customization Coordinator Button */}
                  <a
                    href={getWhatsAppCustomizationLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm hover:scale-[1.01]"
                  >
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                    <span>تنسيق وتفصيل الشال مباشرة عبر الواتساب</span>
                  </a>
                </div>
              )}

              {/* Scheduling Panel */}
              <div className="mb-8 p-6 rounded-2xl glass border border-border space-y-6 animate-fadeIn">
                <div className="flex items-center gap-2 text-primary font-bold text-lg border-b border-border pb-3">
                  <span>🗓️ جدولة وتاريخ الاستلام</span>
                </div>

                {mode === "sale" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border">
                      <div>
                        <span className="text-sm font-bold text-foreground block">الاستلام أول ما يجهز</span>
                        <span className="text-xs text-foreground/60">يتيح لك استلام القطعة فور انتهاء حياكتها وتجهيزها</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isPreliminary}
                        onChange={(e) => {
                          setIsPreliminary(e.target.checked);
                          if (e.target.checked) setPickupDate("");
                        }}
                        className="w-5 h-5 accent-primary cursor-pointer"
                      />
                    </div>

                    {!isPreliminary && (
                      <div className="animate-fadeIn">
                        <label className="text-sm font-bold text-foreground/80 mb-2 block">تحديد تاريخ الاستلام:</label>
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-border bg-surface/50 text-foreground font-bold focus:border-primary focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-foreground/80 mb-2 block">تاريخ الاستلام:</label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-border bg-surface/50 text-foreground font-bold focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-foreground/80 mb-2 block">تاريخ الإرجاع:</label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-border bg-surface/50 text-foreground font-bold focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                )}
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

              {/* Validation Error */}
              {validationError && (
                <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold text-right flex items-center gap-2 animate-shake animate-fadeIn">
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
                  <span>{validationError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                {(() => {
                  const isSaleAvailable = (product.itemMode === "sale" || product.itemMode === "both") && product.priceSale > 0;
                  const isRentAvailable = (product.itemMode === "rent" || product.itemMode === "both") && product.priceRent > 0;
                  const isUnavailableOrSoldOrHidden =
                    product.statusKey === "unavailable" ||
                    product.statusKey === "sold" ||
                    product.statusKey === "hidden" ||
                    product.status === "غير متوفر" ||
                    product.status === "مباع" ||
                    product.status === "مخفي";
                  const isBtnDisabled = isUnavailableOrSoldOrHidden || (mode === "sale" ? !isSaleAvailable : !isRentAvailable);

                  return (
                    <button
                      onClick={handleAddToCart}
                      disabled={isBtnDisabled}
                      className={`flex-1 btn-premium text-lg py-4 gap-2 ${
                        isBtnDisabled ? "opacity-50 cursor-not-allowed bg-border" : ""
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
                          {isUnavailableOrSoldOrHidden
                            ? "غير متوفر حالياً"
                            : mode === "sale" && !isSaleAvailable
                            ? "غير متوفر للبيع"
                            : mode === "rent" && !isRentAvailable
                            ? "غير متوفر للإيجار"
                            : "إضافة للسلة"}
                        </>
                      )}
                    </button>
                  );
                })()}
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-12"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-2.5 rounded-full transition-all z-55 hover:scale-105 border border-white/10"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            {productImages.length > 1 && (
              <>
                {/* Previous (Left Arrow) */}
                <button
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-white/75 hover:text-white bg-black/45 hover:bg-black/75 p-3.5 rounded-full transition-all z-55 hover:scale-110 border border-white/5 active:scale-95"
                  onClick={(e) => {
                    e.stopPropagation();
                    const activeIdx = productImages.indexOf(activeImage);
                    if (activeIdx !== -1) {
                      const prevIdx = (activeIdx - 1 + productImages.length) % productImages.length;
                      setActiveImage(productImages[prevIdx]);
                    }
                  }}
                  title="الصورة السابقة"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Next (Right Arrow) */}
                <button
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/75 hover:text-white bg-black/45 hover:bg-black/75 p-3.5 rounded-full transition-all z-55 hover:scale-110 border border-white/5 active:scale-95"
                  onClick={(e) => {
                    e.stopPropagation();
                    const activeIdx = productImages.indexOf(activeImage);
                    if (activeIdx !== -1) {
                      const nextIdx = (activeIdx + 1) % productImages.length;
                      setActiveImage(productImages[nextIdx]);
                    }
                  }}
                  title="الصورة التالية"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-5xl aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeImage}
                    alt={product.name}
                    fill
                    className="object-contain"
                    quality={100}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
