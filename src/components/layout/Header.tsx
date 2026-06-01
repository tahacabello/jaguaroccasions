"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { getSupabaseSettings } from "@/lib/supabase";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState("توصيل لجميع أنحاء ليبيا 🎓");

  const { cartCount } = useCart();

  // Load dynamic settings from Supabase
  useEffect(() => {
    getSupabaseSettings().then(settings => {
      if (settings.announcement_text) {
        setAnnouncementText(settings.announcement_text);
      }
    }).catch(err => console.error("Error fetching announcement in Header:", err));
  }, []);

  // Handle scroll effect for glass header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-primary/10 text-primary-light text-center py-2 text-sm font-medium border-b border-primary/20">
        {announcementText}
      </div>

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "glass py-3 shadow-lg shadow-black/50"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
              JAGUAR
            </span>
            <span className="text-lg font-bold text-foreground">
              Occasions
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
              المنتجات
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
              الأقسام
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              من نحن
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-foreground/80 hover:text-primary transition-colors rounded-full hover:bg-surface-hover">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/auth/login" className="p-2 text-foreground/80 hover:text-primary transition-colors rounded-full hover:bg-surface-hover">
              <User className="w-5 h-5" />
            </Link>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-foreground/80 hover:text-primary transition-colors rounded-full hover:bg-surface-hover">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-foreground/80 hover:text-primary"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-surface flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <span className="text-2xl font-black bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
                JAGUAR
              </span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-surface-hover rounded-full text-foreground/80 hover:text-primary"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex flex-col p-6 gap-6 text-xl font-bold">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary">الرئيسية</Link>
              <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary">المنتجات</Link>
              <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary">الأقسام</Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary">من نحن</Link>
            </nav>
            
            <div className="mt-auto p-6 border-t border-border">
              <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-premium w-full flex justify-center items-center gap-2">
                <User className="w-5 h-5" />
                تسجيل الدخول
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

