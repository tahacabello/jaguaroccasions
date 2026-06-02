-- =====================================================================
-- 🎓 جاغوار للمناسبات — نظام الحسابات المتقدم وتسجيل الدخول باسم المستخدم وعناوين الخرائط
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل محرر SQL (SQL Editor) في لوحة تحكم Supabase مرة واحدة.
-- =====================================================================

-- 1. إضافة الأعمدة الجديدة لجدول الحسابات (profiles)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS google_maps_link text;

-- 2. فرض قيد فريد لضمان عدم تكرار اسم المستخدم
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- 3. إضافة حقل رابط موقع خرائط جوجل لجدول الطلبات (orders)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS google_maps_link text;

-- 4. إعداد دالة الاستعلام الآمنة لجلب البريد الإلكتروني للمستخدم باستخدام أي معرف (اسم المستخدم / الهاتف / الإيميل)
-- هذه الدالة ضرورية لتمكين تسجيل الدخول المرن من واجهة الزبائن
CREATE OR REPLACE FUNCTION public.get_user_email_by_login_identifier(p_identifier text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_email text;
BEGIN
    -- البحث عن الحساب باستخدام اسم المستخدم أو رقم الهاتف أو البريد الإلكتروني
    SELECT email INTO v_email
    FROM public.profiles
    WHERE username = p_identifier 
       OR phone_number = p_identifier 
       OR email = p_identifier
    LIMIT 1;
    
    RETURN v_email;
END;
$$;

-- 5. تحديث دالة معالجة المستخدمين الجدد (handle_new_user) لتسجيل الحقول الجديدة تلقائياً عند التسجيل الذاتي
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger as $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name, 
    phone_number, 
    backup_phone, 
    city, 
    street, 
    additional_address, 
    is_admin,
    username,
    email,
    google_maps_link
  )
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'زبون جديد'),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'backup_phone', ''),
    coalesce(new.raw_user_meta_data ->> 'city', 'طرابلس'),
    coalesce(new.raw_user_meta_data ->> 'street', ''),
    coalesce(new.raw_user_meta_data ->> 'additional_address', ''),
    coalesce((new.raw_user_meta_data ->> 'is_admin')::boolean, false),
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || substring(gen_random_uuid()::text from 1 for 8)),
    coalesce(new.email, coalesce(new.raw_user_meta_data ->> 'email', '')),
    coalesce(new.raw_user_meta_data ->> 'google_maps_link', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    google_maps_link = EXCLUDED.google_maps_link,
    updated_at = now();
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. تنشيط التغييرات فوراً في لوحة التحكم
SELECT pg_notify('pgrst', 'reload schema');
