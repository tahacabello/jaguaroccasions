import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { WishlistProvider } from "@/context/WishlistContext";

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  weight: ["400", "500", "700", "800", "900"],
  subsets: ["arabic"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "جاغوار Occasions | مستلزمات التخرج الفاخرة في ليبيا",
  description: "المتجر الأول في ليبيا لبيع وإيجار كابات وقبعات وشالات وبروشات التخرج مع التوصيل لجميع أنحاء ليبيا.",
  keywords: ["تخرج", "كاب تخرج", "ليبيا", "جاغوار", "مستلزمات تخرج", "شال تخرج", "بروش تخرج"],
  openGraph: {
    title: "جاغوار Occasions | مستلزمات التخرج الفاخرة في ليبيا",
    description: "المتجر الأول في ليبيا لبيع وإيجار كابات وقبعات وشالات وبروشات التخرج.",
    locale: "ar_LY",
    type: "website",
    siteName: "جاغوار للمناسبات",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable}`}>
      <body className="antialiased min-h-screen flex flex-col transition-colors duration-300">
        <ThemeProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </WishlistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

