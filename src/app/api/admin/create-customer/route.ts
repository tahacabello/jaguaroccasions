import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      username,
      password,
      full_name,
      email,
      phone,
      backup_phone,
      city,
      street,
      address_details,
      google_maps_link,
      passcode
    } = body;

    // 1. Verify admin passcode
    if (passcode !== "9922") {
      return NextResponse.json(
        { error: "غير مصرح بالدخول للإدارة." },
        { status: 401 }
      );
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: "اسم المستخدم وكلمة المرور مطلوبان." },
        { status: 400 }
      );
    }

    // 2. Initialize Supabase Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uxsixllbppablltuvtkj.supabase.co";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    // Handle local mock mode if Supabase Service Role is missing
    if (!supabaseServiceKey) {
      console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is missing in server environment. Simulating creation in mock mode.");
      return NextResponse.json({
        success: true,
        mocked: true,
        user: {
          id: "mock_" + Math.random().toString(36).substring(2, 9),
          email: email || `${username}@jaguar.local`
        }
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 3. Check if username is already taken in profiles table
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "اسم المستخدم مستخدم بالفعل، يرجى اختيار اسم آخر" },
        { status: 400 }
      );
    }

    // 4. Resolve email (generate hidden email if missing)
    const targetEmail = email ? email.trim() : `${username.trim()}@jaguar.local`;

    // 5. Create user securely via Auth Admin API
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: targetEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: full_name || "زبون جديد",
        phone: phone || "",
        backup_phone: backup_phone || "",
        city: city || "طرابلس",
        street: street || "",
        additional_address: address_details || "",
        username: username,
        google_maps_link: google_maps_link || ""
      }
    });

    if (createError) throw createError;
    if (!createData?.user) throw new Error("فشل إنشاء حساب المستخدم في النظام.");

    const newUser = createData.user;

    // 6. Double-check and explicitly update/insert profile row to guarantee fields are written
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: newUser.id,
        name: full_name || "زبون جديد",
        phone: phone || "",
        backup_phone: backup_phone || "",
        city: city || "طرابلس",
        street: street || "",
        additional_address: address_details || "",
        username: username,
        email: targetEmail,
        google_maps_link: google_maps_link || "",
        is_admin: false,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.warn("⚠️ Explicit profile write warning:", profileError.message);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email
      }
    });
  } catch (err: any) {
    console.error("❌ Admin create user route error:", err);
    return NextResponse.json(
      { error: err?.message || "حدث خطأ غير متوقع أثناء معالجة الطلب." },
      { status: 500 }
    );
  }
}
