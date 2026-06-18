"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getSupabaseProducts, mockProducts, getSupabaseSettings } from "@/lib/supabase";

const getArabicStatusLabel = (status: string) => {
  const s = (status || "").toLowerCase().trim();
  if (s === "available" || s === "متوفر") return "متوفر";
  if (s === "unavailable" || s === "غير متوفر" || s === "غير متوفر حالياً") return "غير متوفر";
  if (s === "reserved" || s === "محجوز") return "محجوز";
  if (s === "sold" || s === "مباع") return "مباع";
  if (s === "hidden" || s === "مخفي") return "مخفي";
  return status;
};

export function TrendingProducts() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>(mockProducts.slice(0, 4));
  const [trendingTitle, setTrendingTitle] = useState("الأكثر طلباً");
  const [trendingSubtitle, setTrendingSubtitle] = useState("المنتجات المفضلة لدى خريجي 2026");

  useEffect(() => {
    getSupabaseProducts().then(dbProducts => {
      // Show first 4 products on the homepage carousel
      setProducts(dbProducts.slice(0, 4));
    }).catch(err => console.error("Error loading products in TrendingProducts:", err));

    getSupabaseSettings().then(settings => {
      if (settings.trending_title) setTrendingTitle(settings.trending_title);
      if (settings.trending_subtitle) setTrendingSubtitle(settings.trending_subtitle);
    }).catch(err => console.error(err));
  }, []);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">{trendingTitle}</h2>
            <p className="text-foreground/60 text-lg">{trendingSubtitle}</p>
          </div>
          <Link href="/products" className="hidden sm:flex text-primary hover:text-primary-light font-bold items-center gap-2 transition-colors">
            عرض كل المنتجات
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => {
            const isSaleActive = (product.itemMode === "sale" || product.itemMode === "both") && product.priceSale !== null && product.priceSale !== undefined && product.priceSale > 0;
            const isRentActive = (product.itemMode === "rent" || product.itemMode === "both") && product.priceRent !== null && product.priceRent !== undefined && product.priceRent > 0;
            const isUnavailableOrSoldOrHidden =
              product.statusKey === "unavailable" ||
              product.statusKey === "sold" ||
              product.statusKey === "hidden" ||
              product.status === "غير متوفر" ||
              product.status === "مباع" ||
              product.status === "مخفي";
            const isReserved = product.status === "محجوز" || product.statusKey === "reserved";
            
            const cleanStatus = getArabicStatusLabel(product.status);

            let targetMode: "rent" | "sale" = "rent";
            let targetPrice = 0;
            if (isRentActive) {
              targetMode = "rent";
              targetPrice = product.priceRent;
            } else if (isSaleActive) {
              targetMode = "sale";
              targetPrice = product.priceSale;
            }

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group glass rounded-2xl overflow-hidden hover:border-primary/50 transition-colors flex flex-col justify-between"
              >
                <div className="relative h-72 w-full overflow-hidden bg-surface">
                  <Link href={`/product?id=${product.id}`} className="block h-full w-full">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isUnavailableOrSoldOrHidden ? "bg-red-500/20 text-red-400" : 
                      isReserved ? "bg-amber-500/20 text-amber-400" : 
                      "bg-green-500/20 text-green-400"
                    }`}>
                      {isUnavailableOrSoldOrHidden ? "غير متوفر حالياً" : cleanStatus}
                    </span>
                  </div>
                  <button className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-primary transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0" onClick={(e) => e.preventDefault()}>
                    <Heart className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <Link href={`/product?id=${product.id}`}>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                  </Link>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-black text-primary-light">
                      {isUnavailableOrSoldOrHidden ? (
                        <span className="text-red-500 text-sm">غير متوفر حالياً</span>
                      ) : isRentActive && !isSaleActive ? (
                        <>{product.priceRent} <span className="text-sm font-normal">د.ل (إيجار)</span></>
                      ) : isSaleActive && !isRentActive ? (
                        <>{product.priceSale} <span className="text-sm font-normal">د.ل (شراء)</span></>
                      ) : isRentActive && isSaleActive ? (
                        <div className="flex flex-col text-right">
                          <span className="text-lg font-black text-primary-light">{product.priceRent} <span className="text-xs font-normal">د.ل (إيجار)</span></span>
                          <span className="text-xs text-foreground/50">{product.priceSale} د.ل (شراء)</span>
                        </div>
                      ) : (
                        <span className="text-red-500 text-sm">غير متوفر</span>
                      )}
                    </span>
                    <button
                      disabled={isUnavailableOrSoldOrHidden || (!isSaleActive && !isRentActive)}
                      onClick={() => {
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: targetPrice,
                          image: product.image,
                          mode: targetMode,
                        });
                      }}
                      className={`p-3 bg-surface hover:bg-primary hover:text-black rounded-xl transition-all border border-border group-hover:border-primary/50 ${
                        (isUnavailableOrSoldOrHidden || (!isSaleActive && !isRentActive)) ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
