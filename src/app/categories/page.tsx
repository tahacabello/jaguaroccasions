"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseCategories, getCategoryImage } from "@/lib/supabase";

export default function CategoriesPage() {
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupabaseCategories()
      .then(cats => {
        setCategoriesList(cats || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <title>الأقسام | جاغوار للمناسبات</title>
      <Header />
      <main className="min-h-screen bg-background pt-12 pb-24 text-right">
        <div className="container mx-auto px-4 lg:px-8">
          
          <div className="mb-12">
            <h1 className="text-4xl font-black mb-2">تصفح الأقسام</h1>
            <p className="text-foreground/60">اختر القسم الذي تبحث عنه للوصول السريع للمنتجات</p>
          </div>

          {loading ? (
            /* Premium Dark Shimmer Skeleton Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="h-96 w-full rounded-3xl bg-surface-hover/20 animate-pulse border border-border/30 flex flex-col justify-end p-8 space-y-4"
                >
                  <div className="h-8 bg-surface-hover/50 rounded-lg w-2/3"></div>
                  <div className="h-4 bg-surface-hover/45 rounded-lg w-1/2"></div>
                  <div className="h-4 bg-surface-hover/30 rounded-lg w-1/4"></div>
                </div>
              ))}
            </div>
          ) : categoriesList.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl border border-border">
              <p className="text-foreground/60 text-lg">لا توجد أقسام متوفرة حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categoriesList.map((cat) => (
                <Link key={cat.id} href={`/categories/${cat.id}`} className="group relative h-96 w-full overflow-hidden rounded-3xl glass border border-border flex items-end">
                  <div className="absolute inset-0 z-0">
                    <Image 
                      src={getCategoryImage(cat)} 
                      alt={cat.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-90" 
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
                  </div>

                  <div className="relative z-10 p-8 w-full transform transition-transform duration-300 group-hover:-translate-y-2">
                    <h2 className="text-3xl font-black text-white mb-2">{cat.name}</h2>
                    <p className="text-foreground/70 text-lg mb-6">{cat.desc || cat.name}</p>
                    
                    <div className="inline-flex items-center gap-2 font-bold text-primary hover:text-primary-light transition-colors">
                      تسوق الآن
                      <span className="group-hover:-translate-x-2 transition-transform">←</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
