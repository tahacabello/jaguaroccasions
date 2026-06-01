import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-surface pt-20 pb-10 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-black tracking-tighter bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
                JAGUAR
              </span>
            </Link>
            <p className="text-foreground/70 leading-relaxed text-sm">
              جاغوار للمناسبات - وجهتك الأولى في ليبيا للحصول على أرقى كابات وقبعات التخرج بأسعار تنافسية وجودة لا تضاهى.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-surface-hover rounded-full hover:bg-primary hover:text-black transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="p-2 bg-surface-hover rounded-full hover:bg-primary hover:text-black transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.71.054 1.14.051 1.96.23 2.53.45a4.58 4.58 0 011.57 1.01 4.58 4.58 0 011.01 1.57c.22.57.4 1.39.45 2.53.044.926.054 1.28.054 3.71s-.01 2.784-.054 3.71c-.051 1.14-.23 1.96-.45 2.53a4.607 4.607 0 01-2.58 2.58c-.57.22-1.39.4-2.53.45-.926.044-1.28.054-3.71.054s-2.784-.01-3.71-.054c-1.14-.051-1.96-.23-2.53-.45a4.58 4.58 0 01-1.57-1.01 4.58 4.58 0 01-1.01-1.57c-.22-.57-.4-1.39-.45-2.53C2.01 14.784 2 14.43 2 12s.01-2.784.054-3.71c.051-1.14.23-1.96.45-2.53a4.58 4.58 0 011.01-1.57A4.58 4.58 0 015.05 2.44c.57-.22 1.39-.4 2.53-.45C8.476 2.01 8.83 2 11.235 2h1.08zM12 6.865A5.135 5.135 0 1017.135 12 5.135 5.135 0 0012 6.865zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm5.338-8.205a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="p-2 bg-surface-hover rounded-full hover:bg-primary hover:text-black transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">روابط سريعة</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-foreground/70 hover:text-primary transition-colors text-sm">الرئيسية</Link></li>
              <li><Link href="/products" className="text-foreground/70 hover:text-primary transition-colors text-sm">جميع المنتجات</Link></li>
              <li><Link href="/categories" className="text-foreground/70 hover:text-primary transition-colors text-sm">الأقسام</Link></li>
              <li><Link href="/about" className="text-foreground/70 hover:text-primary transition-colors text-sm">من نحن</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">خدمة العملاء</h4>
            <ul className="space-y-4">
              <li><Link href="/contact" className="text-foreground/70 hover:text-primary transition-colors text-sm">اتصل بنا</Link></li>
              <li><Link href="/faq" className="text-foreground/70 hover:text-primary transition-colors text-sm">الأسئلة الشائعة</Link></li>
              <li><Link href="/shipping" className="text-foreground/70 hover:text-primary transition-colors text-sm">سياسة التوصيل</Link></li>
              <li><Link href="/returns" className="text-foreground/70 hover:text-primary transition-colors text-sm">سياسة الاسترجاع</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">تواصل معنا</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-foreground/70">ليبيا - طرابلس، شارع النصر</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-foreground/70" dir="ltr">+218 92 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-foreground/70">info@jaguar.ly</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground/50">
          <p>© 2026 جاغوار للمناسبات. جميع الحقوق محفوظة.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">سياسة الخصوصية</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">الشروط والأحكام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
