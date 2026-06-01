import Link from "next/link";
import { UserPlus, ArrowRight } from "lucide-react";

export const metadata = {
  title: "إنشاء حساب | جاغوار",
};

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md glass p-8 rounded-2xl border border-border relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center p-3 bg-surface rounded-full mb-4 border border-border text-primary hover:text-primary-light transition-colors">
            <UserPlus className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-black mb-2">حساب جديد</h1>
          <p className="text-foreground/60 text-sm">انضم إلينا لتحصل على تجربة تسوق أسرع وعروض حصرية</p>
        </div>

        <form className="space-y-4" action="#">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-foreground/80">الاسم الأول</label>
              <input 
                type="text" 
                placeholder="أحمد" 
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-foreground/80">الاسم الأخير</label>
              <input 
                type="text" 
                placeholder="محمد" 
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-foreground/80">البريد الإلكتروني</label>
            <input 
              type="email" 
              placeholder="example@email.com" 
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              required
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-foreground/80">كلمة المرور</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              required
              dir="ltr"
            />
          </div>

          <button type="submit" className="btn-premium w-full mt-6">
            إنشاء الحساب
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-sm text-foreground/60">
            لديك حساب بالفعل؟ <Link href="/auth/login" className="text-primary font-bold hover:underline">تسجيل الدخول</Link>
          </p>

          <div className="w-full flex items-center gap-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-foreground/40 font-bold uppercase">أو</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <Link href="/checkout" className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-border hover:border-primary/50 bg-surface hover:bg-surface-hover text-foreground/80 transition-all font-bold text-sm group">
            الاستمرار كضيف (بدون حساب)
            <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
