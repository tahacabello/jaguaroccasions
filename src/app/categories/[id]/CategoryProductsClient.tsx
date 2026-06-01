"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart, Filter, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getSupabaseProducts } from "@/lib/supabase";

// Mock categories map
const categoriesMap: Record<string, { name: string; desc: string }> = {
  gowns: { name: "كابات التخرج", desc: "تشكيلة فاخرة من الكابات الكويتية والكلاسيكية المصممة بعناية فائقة" },
  caps: { name: "قبعات التخرج", desc: "قبعات مخمل وستان تناسب جميع الأذواق ومصممة بأعلى جودة" },
  sashes: { name: "شالات التخرج", desc: "شالات مطرزة بدقة عالية ومخصصة بالاسم والألوان المفضلة لديك" },
  pins: { name: "بروشات التخرج", desc: "بروشات معدنية ومطلية بالذهب بتصاميم مميزة تعبر عن إنجازك" },
};

export default function CategoryProductsClient({ params }: { params: { id: string } }) {
  const { addToCart } = useCart();
  const category = categoriesMap[params.id];
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    getSupabaseProducts().then(dbProducts => {
      setProducts(dbProducts.filter(p => p.categoryId === params.id));
    }).catch(err => console.error("Error loading category products in CPC:", err));
  }, [params.id]);

  if (!category) {
    return (
      <>
        <title>القسم غير موجود | جاغوار</title>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-black mb-4">القسم غير موجود</h1>
            <Link href="/categories" className="btn-premium">الرجوع للأقسام</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }


  return (
    <>
      <title>{`${category.name} | جاغوار`}</title>
      <Header />
      <main className="min-h-screen bg-background pt-8 pb-24 text-right">
        <div className="container mx-auto px-4 lg:px-8">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-8 font-medium overflow-x-auto pb-2">
            <Link href="/" className="hover:text-primary whitespace-nowrap">الرئيسية</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link href="/categories" className="hover:text-primary whitespace-nowrap">الأقسام</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="text-primary whitespace-nowrap">{category.name}</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h1 className="text-4xl font-black mb-2">{category.name}</h1>
              <p className="text-foreground/60 text-base">{category.desc}</p>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl bg-surface hover:bg-surface-hover transition-colors font-bold text-sm">
              <Filter className="w-4 h-4" />
              تصفية وترتيب
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl border border-border">
              <p className="text-foreground/60 text-lg mb-6">لا توجد منتجات في هذا القسم حالياً</p>
              <Link href="/products" className="btn-premium">تصفح كل المنتجات</Link>
            </div>
          ) : (
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
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.status === "متوفر" ? "bg-green-500/20 text-green-400" : 
                        product.status === "محجوز" ? "bg-amber-500/20 text-amber-400" : 
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {product.status}
                      </span>
                    </div>
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
