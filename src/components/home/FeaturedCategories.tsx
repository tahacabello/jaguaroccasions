"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseFeaturedItems, defaultCategories, getCategoryImage, getSupabaseSettings } from "@/lib/supabase";

export function FeaturedCategories() {
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [categoriesTitle, setCategoriesTitle] = useState("الأقسام المميزة");
  const [categoriesSubtitle, setCategoriesSubtitle] = useState("اكتشف مجموعاتنا المصنفة بعناية");

  useEffect(() => {
    getSupabaseFeaturedItems().then(setCategoriesList).catch(err => console.error(err));
    getSupabaseSettings().then(settings => {
      if (settings.categories_title) setCategoriesTitle(settings.categories_title);
      if (settings.categories_subtitle) setCategoriesSubtitle(settings.categories_subtitle);
    }).catch(err => console.error(err));
  }, []);

  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-end mb-12 text-right">
          <div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">{categoriesTitle}</h2>
            <p className="text-foreground/60 text-lg">{categoriesSubtitle}</p>
          </div>
          <Link href="/categories" className="hidden sm:flex text-primary hover:text-primary-light font-bold items-center gap-2 transition-colors">
            عرض كل الأقسام
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoriesList.map((cat, idx) => {
            // Determine target link dynamically based on hierarchy
            const href = cat.isSubcategory 
              ? `/categories/${cat.categoryId}?sub=${cat.id}`
              : `/categories/${cat.id}`;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <Link href={href} className="group relative h-[400px] flex flex-col justify-end overflow-hidden rounded-2xl bg-surface-hover border border-border">
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <Image 
                      src={getCategoryImage(cat)} 
                      alt={cat.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-6 transform transition-transform duration-300 group-hover:-translate-y-2 text-right">
                    <h3 className="text-2xl font-bold text-white mb-1">{cat.name}</h3>
                    <p className="text-primary-light font-medium">{cat.isSubcategory ? "قسم فرعي مميز" : "قسم رئيسي مميز"}</p>
                    
                    {/* Hover Line */}
                    <div className="h-1 w-0 bg-primary mt-4 transition-all duration-300 group-hover:w-12 rounded-full"></div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center sm:hidden">
          <Link href="/categories" className="btn-premium w-full">
            عرض كل الأقسام
          </Link>
        </div>
      </div>
    </section>
  );
}
