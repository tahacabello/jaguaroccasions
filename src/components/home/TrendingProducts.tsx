"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getSupabaseProducts, mockProducts } from "@/lib/supabase";

export function TrendingProducts() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>(mockProducts.slice(0, 4));

  useEffect(() => {
    getSupabaseProducts().then(dbProducts => {
      // Show first 4 products on the homepage carousel
      setProducts(dbProducts.slice(0, 4));
    }).catch(err => console.error("Error loading products in TrendingProducts:", err));
  }, []);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">الأكثر طلباً</h2>
            <p className="text-foreground/60 text-lg">المنتجات المفضلة لدى خريجي 2026</p>
          </div>
          <Link href="/products" className="hidden sm:flex text-primary hover:text-primary-light font-bold items-center gap-2 transition-colors">
            عرض كل المنتجات
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group glass rounded-2xl overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div className="relative h-72 w-full overflow-hidden bg-surface">
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
                    product.status === "متوفر" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {product.status}
                  </span>
                </div>
                {/* Wishlist Button */}
                <button className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-primary transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5">
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                </Link>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-black text-primary-light">{product.price} <span className="text-sm font-normal">د.ل</span></span>
                  <button
                    onClick={() =>
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
