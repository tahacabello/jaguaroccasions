"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { UserPlus, ArrowRight, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

const cityNames: Record<string, string> = {
  tripoli: "طرابلس",
  benghazi: "بنغازي",
  misrata: "مصراتة",
  khoms: "الخمس",
  zawiya: "الزاوية",
  sebha: "سبها",
  garian: "غريان",
  tobruk: "طبرق",
  zleten: "زليتن",
  msallata: "مسلاتة",
  other: "مدينة أخرى",
};

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [backupPhone, setBackupPhone] = useState("");
  const [city, setCity] = useState("tripoli");
  const [street, setStreet] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    if (!firstName || !lastName || !email || !password || !phone || !street) {
      setErrorMsg("الرجاء ملء جميع الحقول المطلوبة");
      setLoading(false);
      return;
    }

    try {
      const fullName = `${firstName} ${lastName}`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            name: fullName,
            phone: phone,
            phone_number: phone,
            backup_phone: backupPhone,
            city: cityNames[city] || city,
            street: street,
            additional_address: addressDetail
          }
        }
      });

      if (error) throw error;

      // Insert/upsert profile explicitly in profiles table to be absolutely certain it exists
      if (data?.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
            city: cityNames[city] || city,
            updated_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.warn("Client-side profile upsert warning (trigger might handle it):", profileError.message);
        }
      }

      setSuccessMsg("تم إنشاء الحساب بنجاح! جاري تحويلك لصفحة تسجيل الدخول...");
      const redirectPath = searchParams.get("redirect");
      setTimeout(() => {
        router.push(`/auth/login?registered=true${redirectPath ? `&redirect=${encodeURIComponent(redirectPath)}` : ""}`);
      }, 2500);

    } catch (err: any) {
      console.error("Registration error:", err);
      setErrorMsg(err?.message || "حدث خطأ أثناء إنشاء الحساب. يرجى التأكد من البيانات.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-24 text-right">
      <div className="w-full max-w-lg glass p-8 rounded-2xl border border-border relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-surface rounded-full mb-4 border border-border text-primary">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
            إنشاء حساب جديد
          </h1>
          <p className="text-foreground/60 text-sm">انضم لزبائن جاغوار لمتابعة وتتبع طلباتك لحظة بلحظة</p>
        </div>

        {errorMsg && (
          <div className="p-4 mb-4 text-xs font-bold text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-4 mb-4 text-xs font-bold text-green-400 bg-green-950/20 border border-green-500/20 rounded-xl">
            🎉 {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-foreground/80">الاسم الأول *</label>
              <input 
                type="text" 
                required
                placeholder="أحمد" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-foreground/80">الاسم الأخير *</label>
              <input 
                type="text" 
                required
                placeholder="الفرجاني" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold"
              />
            </div>
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-foreground/80">البريد الإلكتروني *</label>
              <input 
                type="email" 
                required
                placeholder="example@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-foreground/80">كلمة المرور *</label>
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* Phone & Backup Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-foreground/80">رقم الهاتف الأساسي *</label>
              <input 
                type="tel" 
                required
                placeholder="091XXXXXXX" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-foreground/80">رقم الهاتف الاحتياطي</label>
              <input 
                type="tel" 
                placeholder="092XXXXXXX" 
                value={backupPhone}
                onChange={(e) => setBackupPhone(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* City & Street */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-foreground/80">المدينة *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-bold"
              >
                {Object.entries(cityNames).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-foreground/80">الشارع بالتفصيل *</label>
              <input 
                type="text" 
                required
                placeholder="شارع النصر" 
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold"
              />
            </div>
          </div>

          {/* Additional Address Info */}
          <div>
            <label className="block text-xs font-bold mb-1 text-foreground/80">العنوان بالتفصيل (علامة مميزة، الطابق، إلخ)</label>
            <input 
              type="text" 
              placeholder="بجانب مسجد القدس، عمارة الأمل، الدور الثاني" 
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-premium w-full mt-6 py-3 font-bold text-base flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : "إنشاء حساب جديد والتسجيل"}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-sm text-foreground/60">
            لديك حساب بالفعل؟ <Link href={`/auth/login${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect") || "")}` : ""}`} className="text-primary font-bold hover:underline">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <RegisterContent />
      </Suspense>
      <Footer />
    </>
  );
}
