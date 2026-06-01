"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Trash2, HeartCrack } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { motion } from "framer-motion";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, isLoaded } = useWishlist();
  const { addToCart } = useCart();

  if (!isLoaded) return null;

  return (
    <>
      <title>المفضلة | جاغوار</title>
      <Header />
      <main className="min-h-screen bg-background pt-12 pb-24 text-right">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <h1 className="text-4xl font-black mb-8">قائمة الرغبات</h1>
          
          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-surface rounded-2xl border border-border">
              <HeartCrack className="w-20 h-20 text-foreground/20 mb-6" />
              <h2 className="text-2xl font-bold mb-4">قائمة الرغبات فارغة</h2>
              <p className="text-foreground/60 mb-8 max-w-md">لم تقم بإضافة أي منتجات إلى المفضلة بعد. تصفح منتجاتنا واضغط على علامة القلب للاحتفاظ بها هنا.</p>
              <Link href="/products" className="btn-premium">
                تصفح المنتجات
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group glass rounded-2xl overflow-hidden hover:border-primary/50 transition-colors flex flex-col"
                >
                  <div className="relative h-64 w-full bg-surface">
                    <Link href={`/products/${item.id}`} className="block h-full w-full">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-4 left-4 p-2 rounded-full bg-red-500 text-white backdrop-blur-sm hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${item.id}`}>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{item.name}</h3>
                      </Link>
                      <span className="text-xl font-black text-primary-light mb-4 block">
                        {item.price} <span className="text-sm font-normal">د.ل</span>
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart({ ...item, mode: "sale" })}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-surface hover:bg-primary hover:text-black rounded-xl transition-all border border-border group-hover:border-primary/50 font-bold"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      إضافة للسلة
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
