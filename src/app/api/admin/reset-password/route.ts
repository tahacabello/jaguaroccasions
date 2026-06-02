import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, newPassword, passcode } = body;

    // 1. Verify admin passcode
    if (passcode !== "9922") {
      return NextResponse.json(
        { error: "غير مصرح بالدخول للإدارة." },
        { status: 401 }
      );
    }

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: "معرف المستخدم وكلمة المرور الجديدة مطلوبان." },
        { status: 400 }
      );
    }

    // 2. Initialize Supabase Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uxsixllbppablltuvtkj.supabase.co";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    // Handle local mock mode if Supabase Service Role is missing
    if (!supabaseServiceKey) {
      console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Simulating password reset in mock mode.");
      return NextResponse.json({ success: true, mocked: true });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 3. Reset password securely via Auth Admin API
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) throw error;
    if (!data?.user) throw new Error("فشل تحديث كلمة مرور المستخدم.");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Admin reset password route error:", err);
    return NextResponse.json(
      { error: err?.message || "حدث خطأ غير متوقع أثناء معالجة الطلب." },
      { status: 500 }
    );
  }
}
