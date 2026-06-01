"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart, Filter } from "lucide-react";
import { useCart } from "@/context/CartContext";

// Mock data
const products = [
  { id: "1", name: "كاب كويتي فاخر", price: 85, image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop", status: "متوفر" },
  { id: "2", name: "شال تخرج مطرز", price: 45, image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=400&auto=format&fit=crop", status: "متوفر" },
  { id: "3", name: "بروش مخصص", price: 25, image: "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?q=80&w=400&auto=format&fit=crop", status: "محجوز" },
  { id: "4", name: "روب تخرج أطفال", price: 60, image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=400&auto=format&fit=crop", status: "متوفر" },
  { id: "5", name: "طقم كاب وشال", price: 120, image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop", status: "متوفر" },
  { id: "6", name: "قبعة تخرج مخمل", price: 95, image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=400&auto=format&fit=crop", status: "غير متوفر" },
];

export default function ProductsPage() {
  const { addToCart } = useCart();

  return (
    <>
      <title>جميع المنتجات | جاغوار</title>
      <Header />
      <main className="min-h-screen bg-background pt-12 pb-24 text-right">
        <div className="container mx-auto px-4 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h1 className="text-4xl font-black mb-2">جميع المنتجات</h1>
              <p className="text-foreground/60 text-base">اكتشف تشكيلتنا الكاملة من مستلزمات التخرج الفاخرة</p>
            </div>

            {/* Filter Button */}
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl bg-surface hover:bg-surface-hover transition-colors font-bold text-sm">
              <Filter className="w-4 h-4" />
              تصفية وترتيب
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
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
                  <button className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-primary transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0" onClick={(e) => e.preventDefault()}>
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
              </div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
