"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if they just registered
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMsg("تم تسجيل حسابك بنجاح! يرجى إدخال البريد الإلكتروني وكلمة المرور لتسجيل الدخول.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("يرجى ملء جميع الحقول المطلوبة");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      setSuccessMsg("تم تسجيل الدخول بنجاح! جاري تحويلك...");

      // Fetch user profile to check role
      const user = data.user;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      const redirectPath = searchParams.get("redirect");
      if (profile && !profileError && profile.is_admin) {
        // Save flag in sessionStorage as additional sync
        sessionStorage.setItem("jaguar_admin_auth", "true");
        setTimeout(() => {
          router.push("/admin");
        }, 1500);
      } else if (redirectPath) {
        setTimeout(() => {
          router.push(redirectPath);
        }, 1500);
      } else {
        setTimeout(() => {
          router.push("/account");
        }, 1500);
      }

    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMsg(err?.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md glass p-8 rounded-2xl border border-border relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-surface rounded-full mb-4 border border-border text-primary font-bold">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
            مرحباً بعودتك
          </h1>
          <p className="text-foreground/60 text-sm">سجل دخولك لمتابعة طلباتك أو تتبع حجزك</p>
        </div>

        {errorMsg && (
          <div className="p-4 mb-4 text-xs font-bold text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl animate-shake">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-4 mb-4 text-xs font-bold text-green-400 bg-green-950/20 border border-green-500/20 rounded-xl">
            🎉 {successMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2 text-foreground/80">البريد الإلكتروني</label>
            <input 
              type="email" 
              placeholder="example@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold text-left"
              required
              dir="ltr"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-bold text-foreground/80">كلمة المرور</label>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors font-semibold text-left"
              required
              dir="ltr"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-premium w-full mt-4 py-3 font-bold text-base flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : "تسجيل الدخول"}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-sm text-foreground/60">
            ليس لديك حساب؟ <Link href={`/auth/register${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect") || "")}` : ""}`} className="text-primary font-bold hover:underline">إنشاء حساب جديد</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <LoginContent />
      </Suspense>
      <Footer />
    </>
  );
}
