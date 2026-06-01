"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary-dark/10 rounded-full blur-[100px] opacity-40 mix-blend-screen"></div>
        
        {/* Subtle grid pattern for luxury tech feel */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center flex flex-col items-center">
        {/* Animated Kicker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary-light text-sm font-bold mb-8 shadow-[0_0_20px_rgba(201,168,76,0.15)]"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          تشكيلة تخرج 2026 متوفرة الآن
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 max-w-5xl leading-tight"
        >
          لحظة تخرجك،{" "}
          <span className="bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
            بأرقى المعايير
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-foreground/70 mb-10 max-w-2xl font-medium leading-relaxed"
        >
          اكتشف مجموعتنا الحصرية من كابات التخرج، القبعات، والشالات الفاخرة. بيع وإيجار مع خدمة توصيل لجميع أنحاء ليبيا.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link href="/products" className="btn-premium w-full sm:w-auto text-lg py-4 px-8 group">
            تصفح المتجر
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
            <Link href="/about" className="flex justify-center items-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl font-bold border border-border bg-surface hover:bg-surface-hover hover:border-primary/50 text-foreground transition-all duration-300">
              اكتشف خدماتنا
            </Link>
            <span className="text-xs text-primary-light font-bold tracking-widest mt-1">بنا تكتمل فرحتكم</span>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 flex items-center justify-center gap-12 border-t border-border/50 pt-10 w-full max-w-3xl"
        >
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-primary-light">500+</span>
            <span className="text-sm text-foreground/60 mt-1">منتج فاخر</span>
          </div>
          <div className="w-px h-12 bg-border"></div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-primary-light">24h</span>
            <span className="text-sm text-foreground/60 mt-1">توصيل سريع</span>
          </div>
          <div className="w-px h-12 bg-border"></div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-primary-light">10k+</span>
            <span className="text-sm text-foreground/60 mt-1">عميل سعيد</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
