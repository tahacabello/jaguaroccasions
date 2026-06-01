"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart, Filter } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getSupabaseProducts, getSupabaseCategories, defaultCategories, mockProducts, getProductImage } from "@/lib/supabase";

export default function ProductsPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>(mockProducts);
  const [categories, setCategories] = useState<any[]>(defaultCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  useEffect(() => {
    // Load categories
    getSupabaseCategories().then(setCategories).catch(err => console.error("Error loading categories:", err));

    // Load products
    getSupabaseProducts().then(dbProducts => {
      setProducts(dbProducts);
    }).catch(err => console.error("Error fetching products in products list:", err));
  }, []);

  // Filter products robustly using the central matching logic
  const filteredProducts = products.filter(p => {
    if (selectedCategoryId === "all") return true;

    const found = categories.find(c => c.id === selectedCategoryId);
    if (!found) return false;

    // 1. Direct UUID or ID match
    if (p.categoryId === found.id) return true;

    // 2. Direct slug match
    if (p.categoryId === found.slug) return true;

    // 3. Robust mapping for fallback string IDs vs database slugs
    const pid = (p.categoryId || "").toLowerCase();
    const cslug = (found.slug || "").toLowerCase();
    const cname = (found.name || "").toLowerCase();

    if (pid === "gowns" && (cslug === "gowns" || cslug === "graduation-gowns" || cname.includes("كاب") || cname.includes("كيب"))) return true;
    if (pid === "sashes" && (cslug === "sashes" || cslug === "graduation-sashes" || cname.includes("شال") || cname.includes("شيل"))) return true;
    if (pid === "caps" && (cslug === "caps" || cslug === "graduation-caps" || cname.includes("قبع"))) return true;
    if (pid === "pins" && (cslug === "pins" || cslug === "graduation-pins" || cname.includes("بروش") || cname.includes("إكسسوار"))) return true;

    return false;
  });

  return (
    <>
      <title>جميع المنتجات | جاغوار</title>
      <Header />
      <main className="min-h-screen bg-background pt-12 pb-24 text-right">
        <div className="container mx-auto px-4 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h1 className="text-4xl font-black mb-2">جميع المنتجات</h1>
              <p className="text-foreground/60 text-base">اكتشف تشكيلتنا الكاملة من مستلزمات التخرج</p>
            </div>

            {/* Filter Info */}
            <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl bg-surface text-foreground font-bold text-sm">
              <Filter className="w-4 h-4 text-primary" />
              <span>{filteredProducts.length} منتج</span>
            </div>
          </div>

          {/* Luxurious Category Filter Bar */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-10 border-b border-border/40 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId("all")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shrink-0 transition-all border ${
                selectedCategoryId === "all"
                  ? "bg-primary text-black border-primary"
                  : "bg-surface hover:bg-surface-hover text-foreground/75 border-border"
              }`}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shrink-0 transition-all border ${
                  selectedCategoryId === cat.id
                    ? "bg-primary text-black border-primary"
                    : "bg-surface hover:bg-surface-hover text-foreground/75 border-border"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl border border-border">
              <p className="text-foreground/60 text-lg mb-6">لا توجد منتجات في هذا القسم حالياً</p>
              <button onClick={() => setSelectedCategoryId("all")} className="btn-premium">تصفح كل الأقسام</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
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
                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.status === "متوفر" ? "bg-green-500/20 text-green-400" : 
                        product.status === "محجوز" ? "bg-amber-500/20 text-amber-400" : 
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    {/* Wishlist Button */}
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
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
