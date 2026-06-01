import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "الأقسام | جاغوار",
};

const categories = [
  { id: "gowns", name: "كابات التخرج", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop", desc: "تشكيلة فاخرة من الكابات الكويتية والكلاسيكية" },
  { id: "caps", name: "قبعات التخرج", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop", desc: "قبعات مخمل وستان تناسب جميع الأذواق" },
  { id: "sashes", name: "شالات التخرج", image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800&auto=format&fit=crop", desc: "شالات مطرزة بدقة عالية ومخصصة بالاسم" },
  { id: "pins", name: "بروشات التخرج", image: "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?q=80&w=800&auto=format&fit=crop", desc: "بروشات معدنية ومطلية بالذهب بتصاميم مميزة" },
];

export default function CategoriesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-12 pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          
          <div className="mb-12">
            <h1 className="text-4xl font-black mb-2">تصفح الأقسام</h1>
            <p className="text-foreground/60">اختر القسم الذي تبحث عنه للوصول السريع للمنتجات</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.id}`} className="group relative h-96 w-full overflow-hidden rounded-3xl glass border border-border flex items-end">
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={cat.image} 
                    alt={cat.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-90" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
                </div>

                <div className="relative z-10 p-8 w-full transform transition-transform duration-300 group-hover:-translate-y-2">
                  <h2 className="text-3xl font-black text-white mb-2">{cat.name}</h2>
                  <p className="text-foreground/70 text-lg mb-6">{cat.desc}</p>
                  
                  <div className="inline-flex items-center gap-2 font-bold text-primary hover:text-primary-light transition-colors">
                    تسوق الآن
                    <span className="group-hover:-translate-x-2 transition-transform">←</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
