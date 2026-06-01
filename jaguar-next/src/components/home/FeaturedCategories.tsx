"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const categories = [
  { id: "gowns", name: "كابات التخرج", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop", count: "120+" },
  { id: "caps", name: "قبعات التخرج", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop", count: "80+" },
  { id: "sashes", name: "شالات التخرج", image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=600&auto=format&fit=crop", count: "200+" },
  { id: "pins", name: "بروشات التخرج", image: "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?q=80&w=600&auto=format&fit=crop", count: "150+" },
];

export function FeaturedCategories() {
  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">الأقسام المميزة</h2>
            <p className="text-foreground/60 text-lg">اكتشف مجموعاتنا المصنفة بعناية</p>
          </div>
          <Link href="/categories" className="hidden sm:flex text-primary hover:text-primary-light font-bold items-center gap-2 transition-colors">
            عرض كل الأقسام
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <Link href={`/categories/${cat.id}`} className="group relative h-[400px] flex flex-col justify-end overflow-hidden rounded-2xl bg-surface-hover border border-border">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={cat.image} 
                    alt={cat.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 p-6 transform transition-transform duration-300 group-hover:-translate-y-2">
                  <h3 className="text-2xl font-bold text-white mb-1">{cat.name}</h3>
                  <p className="text-primary-light font-medium">{cat.count} منتج</p>
                  
                  {/* Hover Line */}
                  <div className="h-1 w-0 bg-primary mt-4 transition-all duration-300 group-hover:w-12 rounded-full"></div>
                </div>
              </Link>
            </motion.div>
          ))}
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
