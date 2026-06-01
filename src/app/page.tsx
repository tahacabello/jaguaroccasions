import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { DynamicSections } from "@/components/home/DynamicSections";
import { TrustBadges } from "@/components/home/TrustBadges";

export default function Home() {
  return (
    <>
      <title>جاغوار للمناسبات | الصفحة الرئيسية</title>
      <Header />
      <main className="flex-1">
        <Hero />
        <DynamicSections />
        <TrustBadges />
      </main>
      <Footer />
    </>
  );
}

