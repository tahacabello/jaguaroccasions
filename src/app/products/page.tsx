"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart, Filter, Search, ArrowDownAZ } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getSupabaseProducts, mockProducts } from "@/lib/supabase";

export default function ProductsPage() {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState<any[]>(mockProducts);
  
  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    getSupabaseProducts().then(dbProducts => {
      setProducts(dbProducts);
    }).catch(err => console.error("Error fetching products in products list:", err));
  }, []);

  // Filter and Sort logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.priceSale - b.priceSale;
    if (sortBy === "price_desc") return b.priceSale - a.priceSale;
    if (sortBy === "sales") return (b.sales || 0) - (a.sales || 0);
    // newest default (assuming higher id or just as is)
    return 0;
  });

  return (
    <>
      <title>جميع المنتجات | جاغوار</title>
      <Header />
      <main className="min-h-screen bg-background pt-12 pb-24 text-right">
        <div className="container mx-auto px-4 lg:px-8">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-black mb-2">جميع المنتجات</h1>
              <p className="text-foreground/60 text-base">اكتشف تشكيلتنا الكاملة من مستلزمات التخرج الفاخرة</p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <input 
                  type="text" 
                  placeholder="ابحث عن منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary text-sm"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-foreground/40" />
              </div>
              
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary text-sm"
              >
                <option value="all">كل الحالات</option>
                <option value="متوفر">متوفر</option>
                <option value="محجوز">محجوز</option>
                <option value="غير متوفر">غير متوفر</option>
              </select>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary text-sm"
              >
                <option value="newest">الأحدث</option>
                <option value="price_asc">السعر: من الأقل</option>
                <option value="price_desc">السعر: من الأعلى</option>
                <option value="sales">الأكثر مبيعاً</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group glass rounded-2xl overflow-hidden hover:border-primary/50 transition-colors">
                <div className="block relative h-72 w-full overflow-hidden bg-surface">
                  <Link href={`/products/${product.id}`} className="block h-full w-full">
                    <Image
                      src={product.image}
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
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      if (isInWishlist(product.id)) {
                        removeFromWishlist(product.id);
                      } else {
                        addToWishlist({
                          id: product.id,
                          name: product.name,
                          price: product.priceSale,
                          image: product.image
                        });
                      }
                    }}
                    className={`absolute top-4 left-4 p-2 rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 ${
                      isInWishlist(product.id) ? "bg-red-500 text-white" : "bg-black/50 text-white hover:bg-primary"
                    }`}
                  >
                    <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
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

        </div>
      </main>
      <Footer />
    </>
  );
}
