"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  getSupabaseHomepageSections,
  getSupabaseCategories,
  getSupabaseSubcategories,
  getSupabaseProducts,
  getCategoryImage,
  getProductImage,
  resolveAssetPath
} from "@/lib/supabase";

const getArabicStatusLabel = (status: string) => {
  const s = (status || "").toLowerCase().trim();
  if (s === "available" || s === "متوفر") return "متوفر";
  if (s === "unavailable" || s === "غير متوفر" || s === "غير متوفر حالياً") return "غير متوفر";
  if (s === "reserved" || s === "محجوز") return "محجوز";
  if (s === "sold" || s === "مباع") return "مباع";
  if (s === "hidden" || s === "مخفي") return "مخفي";
  return status;
};

export function DynamicSections() {
  const { addToCart } = useCart();
  const [sections, setSections] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dbSections, dbCategories, dbSubcategories, dbProducts] = await Promise.all([
          getSupabaseHomepageSections(),
          getSupabaseCategories(),
          getSupabaseSubcategories(),
          getSupabaseProducts(),
        ]);

        setSections(dbSections.filter((s: any) => s.is_visible));
        setCategories(dbCategories);
        setSubcategories(dbSubcategories);
        setProducts(dbProducts);
      } catch (err) {
        console.error("Failed to load storefront dynamic sections:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 bg-background text-right container mx-auto px-4 lg:px-8 space-y-16 animate-pulse">
        {[1, 2].map((sec) => (
          <div key={sec} className="space-y-8">
            <div className="space-y-3">
              <div className="h-8 bg-surface-hover/50 rounded w-1/4"></div>
              <div className="h-4 bg-surface-hover/30 rounded w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 w-full rounded-2xl bg-surface-hover/20 border border-border/30 flex flex-col justify-end p-5 space-y-4">
                  <div className="h-40 w-full bg-surface-hover/40 rounded-xl mb-2"></div>
                  <div className="h-6 bg-surface-hover/50 rounded w-3/4"></div>
                  <div className="h-4 bg-surface-hover/30 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sections.length === 0) {
    // If deleted/empty, hide sections completely
    return null;
  }

  return (
    <>
      {sections.map((section, secIdx) => {
        // Filter out hidden items inside visible sections
        const activeItems = (section.homepage_section_items || []).filter((item: any) => item.is_visible);

        if (activeItems.length === 0) return null;

        return (
          <section
            key={section.id}
            className={`py-20 ${secIdx % 2 === 0 ? "bg-surface" : "bg-background"} relative overflow-hidden`}
          >
            <div className="container mx-auto px-4 lg:px-8 text-right">
              
              {/* Header */}
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black mb-4">{section.title}</h2>
                  {section.subtitle && <p className="text-foreground/60 text-lg">{section.subtitle}</p>}
                </div>
                
                {section.section_type === "categories" && (
                  <Link href="/categories" className="hidden sm:flex text-primary hover:text-primary-light font-bold items-center gap-2 transition-colors">
                    عرض كل الأقسام <ArrowRight className="w-4 h-4 rotate-180" />
                  </Link>
                )}
                {section.section_type === "products" && (
                  <Link href="/products" className="hidden sm:flex text-primary hover:text-primary-light font-bold items-center gap-2 transition-colors">
                    عرض كل المنتجات <ArrowRight className="w-4 h-4 rotate-180" />
                  </Link>
                )}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeItems.map((item: any, idx: number) => {
                  
                  // 1. If Category
                  if (item.linked_type === "category") {
                    const matchedCat = categories.find(c => c.id === item.linked_id);
                    if (!matchedCat) return null;

                    const title = item.display_title || matchedCat.name;
                    const subtitle = item.display_subtitle || matchedCat.desc || "قسم رئيسي";
                    const image = item.display_image_url || getCategoryImage(matchedCat);
                    const href = `/categories/${matchedCat.id}`;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.08, duration: 0.4 }}
                      >
                        <Link href={href} className="group relative h-[400px] flex flex-col justify-end overflow-hidden rounded-2xl bg-surface-hover border border-border">
                          <div className="absolute inset-0 z-0">
                            <Image
                              src={image}
                              alt={title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-85"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent"></div>
                          </div>

                          <div className="relative z-10 p-6 transform transition-transform duration-300 group-hover:-translate-y-2">
                            <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
                            <p className="text-primary-light font-medium text-sm">{subtitle}</p>
                            <div className="h-1 w-0 bg-primary mt-4 transition-all duration-300 group-hover:w-12 rounded-full"></div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  }

                  // 2. If Subcategory
                  if (item.linked_type === "subcategory") {
                    const matchedSub = subcategories.find(s => s.id === item.linked_id);
                    if (!matchedSub) return null;

                    const title = item.display_title || matchedSub.name;
                    const subtitle = item.display_subtitle || matchedSub.desc || "قسم فرعي";
                    const image = item.display_image_url || matchedSub.image || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop";
                    const href = `/categories/${matchedSub.category_id}?sub=${matchedSub.id}`;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.08, duration: 0.4 }}
                      >
                        <Link href={href} className="group relative h-[400px] flex flex-col justify-end overflow-hidden rounded-2xl bg-surface-hover border border-border">
                          <div className="absolute inset-0 z-0">
                            <Image
                              src={image}
                              alt={title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-85"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent"></div>
                          </div>

                          <div className="relative z-10 p-6 transform transition-transform duration-300 group-hover:-translate-y-2">
                            <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
                            <p className="text-primary-light font-medium text-sm">{subtitle}</p>
                            <div className="h-1 w-0 bg-primary mt-4 transition-all duration-300 group-hover:w-12 rounded-full"></div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  }

                  // 3. If Product
                  if (item.linked_type === "product") {
                    const matchedProd = products.find(p => p.id === item.linked_id);
                    if (!matchedProd) return null;

                    const title = item.display_title || matchedProd.name;
                    const image = item.display_image_url || getProductImage(matchedProd);
                    const href = `/product?id=${matchedProd.id}`;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.08, duration: 0.4 }}
                        className="group glass rounded-2xl overflow-hidden hover:border-primary/50 transition-colors flex flex-col justify-between"
                      >
                        <div className="relative h-72 w-full overflow-hidden bg-surface">
                          <Link href={href} className="block h-full w-full">
                            <Image
                              src={image}
                              alt={title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                          </Link>
                          {/* Badges */}
                          <div className="absolute top-4 right-4 flex flex-col gap-2">
                            {(() => {
                              const isUnavailableOrSoldOrHidden =
                                matchedProd.statusKey === "unavailable" ||
                                matchedProd.statusKey === "sold" ||
                                matchedProd.statusKey === "hidden" ||
                                matchedProd.status === "غير متوفر" ||
                                matchedProd.status === "مباع" ||
                                matchedProd.status === "مخفي";
                              const isReserved = matchedProd.status === "محجوز" || matchedProd.statusKey === "reserved";
                              const cleanStatus = getArabicStatusLabel(matchedProd.status);

                              return (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  isUnavailableOrSoldOrHidden ? "bg-red-500/20 text-red-400" :
                                  isReserved ? "bg-amber-500/20 text-amber-400" :
                                  "bg-green-500/20 text-green-400"
                                }`}>
                                  {isUnavailableOrSoldOrHidden ? "غير متوفر حالياً" : cleanStatus}
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <Link href={href}>
                            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
                          </Link>
                          {matchedProd.description && (
                            <p className="text-xs text-foreground/50 line-clamp-2 mb-4 leading-relaxed">
                              {item.display_subtitle || matchedProd.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-auto">
                            {(() => {
                              const isUnavailableOrSoldOrHidden =
                                matchedProd.statusKey === "unavailable" ||
                                matchedProd.statusKey === "sold" ||
                                matchedProd.statusKey === "hidden" ||
                                matchedProd.status === "غير متوفر" ||
                                matchedProd.status === "مباع" ||
                                matchedProd.status === "مخفي";
                              const isSaleActive = (matchedProd.itemMode === "sale" || matchedProd.itemMode === "both") && matchedProd.priceSale !== null && matchedProd.priceSale !== undefined && matchedProd.priceSale > 0;
                              const isRentActive = (matchedProd.itemMode === "rent" || matchedProd.itemMode === "both") && matchedProd.priceRent !== null && matchedProd.priceRent !== undefined && matchedProd.priceRent > 0;

                              let targetMode: "rent" | "sale" = "rent";
                              let targetPrice = 0;
                              if (isRentActive) {
                                targetMode = "rent";
                                targetPrice = matchedProd.priceRent;
                              } else if (isSaleActive) {
                                targetMode = "sale";
                                targetPrice = matchedProd.priceSale;
                              }

                              return (
                                <>
                                  <div className="flex flex-col">
                                    {isUnavailableOrSoldOrHidden ? (
                                      <span className="text-red-500 text-sm font-bold">غير متوفر حالياً</span>
                                    ) : isRentActive && !isSaleActive ? (
                                      <span className="text-lg font-black text-primary-light">
                                        {matchedProd.priceRent} <span className="text-xs font-normal">د.ل إيجار</span>
                                      </span>
                                    ) : isSaleActive && !isRentActive ? (
                                      <span className="text-lg font-black text-primary-light">
                                        {matchedProd.priceSale} <span className="text-xs font-normal">د.ل شراء</span>
                                      </span>
                                    ) : isRentActive && isSaleActive ? (
                                      <div className="flex flex-col text-right">
                                        <span className="text-lg font-black text-primary-light">
                                          {matchedProd.priceRent} <span className="text-xs font-normal">د.ل إيجار</span>
                                        </span>
                                        <span className="text-xs text-foreground/50">
                                          {matchedProd.priceSale} د.ل شراء
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-red-500 text-sm font-bold">غير متوفر</span>
                                    )}
                                  </div>
                                  <button
                                    disabled={isUnavailableOrSoldOrHidden || (!isSaleActive && !isRentActive)}
                                    onClick={() => {
                                      addToCart({
                                        id: matchedProd.id,
                                        name: matchedProd.name,
                                        price: targetPrice,
                                        image: matchedProd.image,
                                        mode: targetMode,
                                      });
                                    }}
                                    className={`p-3 bg-surface hover:bg-primary hover:text-black rounded-xl transition-all border border-border group-hover:border-primary/50 ${
                                      (isUnavailableOrSoldOrHidden || (!isSaleActive && !isRentActive)) ? "opacity-40 cursor-not-allowed" : ""
                                    }`}
                                  >
                                    <ShoppingBag className="w-5 h-5" />
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </motion.div>
                    );
                  }

                  return null;
                })}
              </div>

              {section.section_type === "categories" && (
                <div className="mt-8 text-center sm:hidden">
                  <Link href="/categories" className="btn-premium w-full">
                    عرض كل الأقسام
                  </Link>
                </div>
              )}
              {section.section_type === "products" && (
                <div className="mt-8 text-center sm:hidden">
                  <Link href="/products" className="btn-premium w-full">
                    عرض كل المنتجات
                  </Link>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
