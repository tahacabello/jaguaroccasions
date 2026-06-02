"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { getSupabaseSettings } from "@/lib/supabase";

export function Footer() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getSupabaseSettings().then(res => {
      setSettings(res);
    }).catch(err => console.error("Error fetching contact settings in Footer:", err));
  }, []);

  return (
    <footer className="bg-surface pt-20 pb-10 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="space-y-6">
            <Link href="/" className="inline-block flex items-center gap-2">
              <span className="text-3xl font-black tracking-tighter bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
                جاغوار
              </span>
              <span className="text-xl font-bold text-foreground">
                Occasions
              </span>
            </Link>
            <p className="text-foreground/70 leading-relaxed text-sm">
              جاغوار للمناسبات - وجهتك الأولى في ليبيا للحصول على أرقى كابات وقبعات التخرج بأسعار تنافسية وجودة لا تضاهى.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              {settings.facebook_link && (
                <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="p-2 bg-surface-hover rounded-full hover:bg-primary hover:text-black transition-colors text-foreground/80 hover:scale-105" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
              {settings.instagram_link && (
                <a href={settings.instagram_link} target="_blank" rel="noopener noreferrer" className="p-2 bg-surface-hover rounded-full hover:bg-primary hover:text-black transition-colors text-foreground/80 hover:scale-105" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.71.054 1.14.051 1.96.23 2.53.45a4.58 4.58 0 011.57 1.01 4.58 4.58 0 011.01 1.57c.22.57.4 1.39.45 2.53.044.926.054 1.28.054 3.71s-.01 2.784-.054 3.71c-.051 1.14-.23 1.96-.45 2.53a4.607 4.607 0 01-2.58 2.58c-.57.22-1.39.4-2.53.45-.926.044-1.28.054-3.71.054s-2.784-.01-3.71-.054c-1.14-.051-1.96-.23-2.53-.45a4.58 4.58 0 01-1.57-1.01 4.58 4.58 0 01-1.01-1.57c-.22-.57-.4-1.39-.45-2.53C2.01 14.784 2 14.43 2 12s.01-2.784.054-3.71c.051-1.14.23-1.96.45-2.53a4.58 4.58 0 011.01-1.57A4.58 4.58 0 015.05 2.44c.57-.22 1.39-.4 2.53-.45C8.476 2.01 8.83 2 11.235 2h1.08zM12 6.865A5.135 5.135 0 1017.135 12 5.135 5.135 0 0012 6.865zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm5.338-8.205a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
              {settings.tiktok_link && (
                <a href={settings.tiktok_link} target="_blank" rel="noopener noreferrer" className="p-2 bg-surface-hover rounded-full hover:bg-primary hover:text-black transition-colors text-foreground/80 hover:scale-105" aria-label="TikTok">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.94-1.78-.22-.22-.41-.47-.58-.73v7.02c0 3.97-2.73 7.89-7.16 8.35-4.14.5-8.44-2.02-9.45-6.22-1.22-4.52 1.83-9.62 6.44-10.14.77-.1 1.56-.07 2.33.07v4.3c-.8-.21-1.66-.23-2.44.07-1.74.59-2.87 2.45-2.61 4.31.29 2.14 2.38 3.75 4.5 3.39 1.73-.22 3.19-1.72 3.19-3.47v-12.43z" />
                  </svg>
                </a>
              )}
              {settings.twitter_link && (
                <a href={settings.twitter_link} target="_blank" rel="noopener noreferrer" className="p-2 bg-surface-hover rounded-full hover:bg-primary hover:text-black transition-colors text-foreground/80 hover:scale-105" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {settings.snapchat_link && (
                <a href={settings.snapchat_link} target="_blank" rel="noopener noreferrer" className="p-2 bg-surface-hover rounded-full hover:bg-primary hover:text-black transition-colors text-foreground/80 hover:scale-105" aria-label="Snapchat">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.75c-3.15 0-5.88 2.06-5.88 5.61 0 .23.01.48.03.73-.59.18-1.04.59-1.27 1.13-.25.59-.16 1.25.26 1.83.27.38.64.67 1.07.82-.01.07-.01.15-.01.23 0 1.28.61 2.37 1.63 2.94.34.19.72.33 1.12.42.27.59.84.98 1.48 1.04.52.05 1.05-.05 1.5-.28.45.23.98.33 1.5.28.64-.06 1.21-.45 1.48-1.04.4.09.78.23 1.12.42 1.02-.57 1.63-1.66 1.63-2.94 0-.08 0-.16-.01-.23.43-.15.8-.44 1.07-.82.42-.58.51-1.24.26-1.83-.23-.54-.68-.95-1.27-1.13.02-.25.03-.5.03-.73 0-3.55-2.73-5.61-5.88-5.61zm0 1.25c2.32 0 4.63 1.43 4.63 4.36 0 .22-.01.45-.03.68v.5c0 .35.28.62.62.62.33 0 .61-.17.75-.48.24-.53.7-.35.81.25a1.18 1.18 0 01-.18.73c-.22.31-.56.54-.95.62-.25.05-.44.25-.47.5-.06.56-.3 1.05-.69 1.43-.37.37-.87.58-1.39.58-.29 0-.54.19-.61.47a2.022 2.022 0 01-1.88 1.47c-.77.02-1.49-.41-1.82-1.11-.12-.25-.37-.41-.65-.4a1.996 1.996 0 01-1.87 1.47c-.77.02-1.49-.41-1.82-1.11-.12-.25-.37-.41-.65-.4-.52 0-1.02-.21-1.39-.58-.39-.38-.63-.87-.69-1.43-.03-.25-.22-.45-.47-.5-.39-.08-.73-.31-.95-.62a1.18 1.18 0 01-.18-.73c.11-.6.57-.78.81-.25.14.31.42.48.75.48.34 0 .62-.27.62-.62v-.5c-.02-.23-.03-.46-.03-.68 0-2.93 2.31-4.36 4.63-4.36z" />
                  </svg>
                </a>
              )}
              {(settings.whatsapp_link || settings.whatsapp_number) && (
                <a href={settings.whatsapp_link || `https://wa.me/${settings.whatsapp_number.replace(/\+/g, "").replace(/\s/g, "")}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-surface-hover rounded-full hover:bg-primary hover:text-black transition-colors text-foreground/80 hover:scale-105" aria-label="WhatsApp">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12c0 2.17.7 4.19 1.89 5.83l-1.25 3.65 3.79-1.21C8.03 21.43 9.94 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.72 13.9c-.25.7-.97 1.25-1.63 1.4-.49.12-1.13.23-3.26-.64-2.73-1.11-4.48-3.9-4.61-4.08-.13-.18-1.09-1.45-1.09-2.76 0-1.31.68-1.96.93-2.22.25-.26.54-.33.72-.33.18 0 .36.01.52.02.17.01.4.06.61.57.25.61.85 2.06.92 2.21.08.15.13.33.03.53-.1.2-.2.33-.36.53-.16.2-.33.33-.49.53-.17.2-.35.42-.15.77.2.34.89 1.46 1.91 2.37 1.31 1.17 2.42 1.53 2.76 1.7.34.17.54.14.74-.09.2-.23.85-.99 1.08-1.33.23-.34.46-.29.77-.18.31.11 1.97.93 2.31 1.1.34.17.57.25.65.39.08.14.08.82-.17 1.52z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
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
              {settings.rental_policy && (
                <li>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-foreground/70 hover:text-primary transition-colors text-sm text-right"
                  >
                    سياسة الإيجار
                  </button>
                </li>
              )}
              <li><Link href="/returns" className="text-foreground/70 hover:text-primary transition-colors text-sm">سياسة الاسترجاع</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">تواصل معنا</h4>
            <ul className="space-y-4">
              {settings.location && (
                <li className="flex flex-col gap-1 items-start">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/70">{settings.location}</span>
                  </div>
                  {settings.google_maps_link && (
                    <a 
                      href={settings.google_maps_link}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mr-8 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-light transition-colors border border-primary/20 hover:border-primary/50 bg-primary/5 px-2.5 py-1 rounded-lg w-fit"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>عرض الموقع على الخريطة</span>
                    </a>
                  )}
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm text-foreground/70" dir="ltr">{settings.contact_phone}</span>
                </li>
              )}
              {settings.contact_email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm text-foreground/70">{settings.contact_email}</span>
                </li>
              )}
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

      {/* Rental Policy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="glass p-8 rounded-3xl border border-primary/20 max-w-xl w-full relative space-y-6 text-right overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.1)]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-light via-primary to-primary-dark"></div>
            
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="text-2xl font-black bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
                سياسة الإيجار المعتمدة
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-surface-hover rounded-full text-foreground/70 hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line overflow-y-auto max-h-[60vh] pr-2">
              {settings.rental_policy}
            </p>
            
            <div className="flex justify-end pt-4 border-t border-border">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-primary text-black font-black hover:bg-primary-light rounded-xl text-xs transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
