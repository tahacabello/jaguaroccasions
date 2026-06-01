"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart, Filter, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { 
  getSupabaseProducts, 
  getSupabaseCategories, 
  getProductImage, 
  getSupabaseSubcategories, 
  getCategoryImage 
} from "@/lib/supabase";

export default function CategoryProductsClient({ params }: { params: { id: string } }) {
  const { addToCart } = useCart();
  const [category, setCategory] = useState<any>({ name: "جاري التحميل...", desc: "" });
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isValidCategory, setIsValidCategory] = useState(true);

  useEffect(() => {
    // Fetch categories and resolve current
    getSupabaseCategories().then(cats => {
      const decodedParamId = decodeURIComponent(params.id);
      const found = cats.find((c: any) => 
        c.id === params.id || 
        c.slug === params.id || 
        c.slug === decodedParamId ||
        c.name === params.id ||
        c.name === decodedParamId
      );

      if (found) {
        setCategory(found);
        setIsValidCategory(true);

        // Fetch subcategories for this category
        getSupabaseSubcategories(found.id).then(subs => {
          const activeSubs = subs.filter(s => s.is_active);
          setSubcategories(activeSubs);

          // Check if there is a pre-selected subcategory in the URL
          if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const subId = urlParams.get("sub");
            if (subId) {
              const matchedSub = activeSubs.find(s => s.id === subId);
              if (matchedSub) {
                setSelectedSubcategory(matchedSub);
              }
            }
          }
        }).catch(err => console.error("Error loading subcategories:", err));

        // Fetch products in category and filter them robustly
        getSupabaseProducts().then(dbProducts => {
          const filtered = dbProducts.filter(p => {
            if (!p.categoryId) return false;

            // 1. Direct UUID or ID match
            if (p.categoryId === found.id) return true;

            // 2. Direct slug match
            if (p.categoryId === found.slug) return true;

            // 3. Robust mapping for fallback IDs used in the DB vs the categories slugs
            const pid = p.categoryId.toLowerCase();
            const cslug = (found.slug || "").toLowerCase();
            const cname = (found.name || "").toLowerCase();

            if (pid === "gowns" && (cslug === "gowns" || cslug === "graduation-gowns" || cname.includes("كاب") || cname.includes("كيب"))) return true;
            if (pid === "sashes" && (cslug === "sashes" || cslug === "graduation-sashes" || cname.includes("شال") || cname.includes("شيل"))) return true;
            if (pid === "caps" && (cslug === "caps" || cslug === "graduation-caps" || cname.includes("قبع"))) return true;
            if (pid === "pins" && (cslug === "pins" || cslug === "graduation-pins" || cname.includes("بروش") || cname.includes("إكسسوار"))) return true;

            return false;
          });
          setProducts(filtered);
        }).catch(err => console.error("Error loading products in CPC:", err));
      } else {
        setIsValidCategory(false);
      }
    }).catch(err => {
      console.error(err);
      setIsValidCategory(false);
    });
  }, [params.id]);

  if (!isValidCategory) {
    return (
      <>
        <title>القسم غير موجود | جاغوار</title>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-black mb-4">القسم غير موجود</h1>
            <Link href="/categories" className="btn-premium">الرجوع للأقسام</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <title>{`${selectedSubcategory ? selectedSubcategory.name : category.name} | جاغوار`}</title>
      <Header />
      <main className="min-h-screen bg-background pt-8 pb-24 text-right">
        <div className="container mx-auto px-4 lg:px-8">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-8 font-medium overflow-x-auto pb-2">
            <Link href="/" className="hover:text-primary whitespace-nowrap">الرئيسية</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link href="/categories" className="hover:text-primary whitespace-nowrap">الأقسام</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            
            {selectedSubcategory ? (
              <>
                <button onClick={() => setSelectedSubcategory(null)} className="hover:text-primary whitespace-nowrap">{category.name}</button>
                <ChevronRight className="w-4 h-4 shrink-0" />
                <span className="text-primary whitespace-nowrap">{selectedSubcategory.name}</span>
              </>
            ) : (
              <span className="text-primary whitespace-nowrap">{category.name}</span>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h1 className="text-4xl font-black mb-2">{selectedSubcategory ? selectedSubcategory.name : category.name}</h1>
              <p className="text-foreground/60 text-base">{selectedSubcategory ? (selectedSubcategory.desc || "عرض كافة منتجات القسم الفرعي") : category.desc}</p>
            </div>

            {selectedSubcategory && (
              <button 
                onClick={() => setSelectedSubcategory(null)} 
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl bg-surface hover:bg-surface-hover transition-colors font-bold text-sm text-primary"
              >
                العودة للأقسام الفرعية
              </button>
            )}
          </div>

          {/* Core dynamic flow: Subcategories vs Products */}
          {subcategories.length > 0 && !selectedSubcategory ? (
            /* Show Subcategories Cards Grid */
            <div className="space-y-6">
              <h3 className="text-lg font-bold mb-4 text-foreground/80">الأقسام والفروع التابعة:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subcategories.map((sub) => (
                  <div 
                    key={sub.id} 
                    onClick={() => setSelectedSubcategory(sub)}
                    className="group relative h-[250px] flex flex-col justify-end overflow-hidden rounded-2xl bg-surface-hover border border-border cursor-pointer transition-all hover:border-primary/50"
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                      <Image 
                        src={getCategoryImage(sub)} 
                        alt={sub.name} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-80" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-6 text-right">
                      <h4 className="text-xl font-bold text-white mb-1">{sub.name}</h4>
                      <p className="text-primary-light font-medium text-xs">تصفح المنتجات</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Show Products List */
            <div>
              {(() => {
                // Filter products by selected subcategory if subcategories exist
                const displayedProducts = selectedSubcategory 
                  ? products.filter(p => p.subcategoryId === selectedSubcategory.id)
                  : products;

                if (displayedProducts.length === 0) {
                  return (
                    <div className="text-center py-20 glass rounded-3xl border border-border">
                      <p className="text-foreground/60 text-lg mb-6">لا توجد منتجات متوفرة حالياً في هذا القسم</p>
                      {selectedSubcategory && (
                        <button onClick={() => setSelectedSubcategory(null)} className="btn-premium">الرجوع للفروع</button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayedProducts.map((product) => (
                      <div key={product.id} className="group glass rounded-2xl overflow-hidden hover:border-primary/50 transition-colors">
                        <div className="block relative h-72 w-full overflow-hidden bg-surface">
                          <Link href={`/products/${product.id}`} className="block h-full w-full">
                            <Image
                              src={getProductImage(product)}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </Link>
                          <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              product.status === "متوفر" ? "bg-green-500/20 text-green-400" : 
                              product.status === "محجوز" ? "bg-amber-500/20 text-amber-400" : 
                              "bg-red-500/20 text-red-400"
                            }`}>
                              {product.status}
                            </span>
                          </div>
                          <button className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-primary transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0" onClick={(e) => e.preventDefault()}>
                            <Heart className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="p-5">
                          <Link href={`/products/${product.id}`}>
                            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                          </Link>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-xl font-black text-primary-light">{product.priceSale} <span className="text-sm font-normal">د.ل</span></span>
                            <button
                              onClick={() =>
                                addToCart({
                                  id: product.id,
                                  name: product.name,
                                  price: product.priceSale,
                                  image: product.image,
                                  mode: "sale",
                                })
                              }
                              className="p-3 bg-surface hover:bg-primary hover:text-black rounded-xl transition-all border border-border group-hover:border-primary/50"
                            >
                              <ShoppingBag className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
