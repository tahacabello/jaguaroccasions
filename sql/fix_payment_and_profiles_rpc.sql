-- =====================================================================
-- 🎓 جاغوار للمناسبات — ترقية نظام الدفع وقائمة العملاء وتجاوز الـ RLS للإدارة
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل محرر SQL (SQL Editor) في لوحة تحكم Supabase.

-- 1. التأكد من وجود قيمة 'cash_on_delivery' في نوع الـ Enum (payment_method) بشكل آمن دون أخطاء
ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'cash_on_delivery';

-- 2. إعداد دالة إدخال الطلب المحدثة لتقوم بتحويل نوع وسيلة الدفع (Casting) بشكل صحيح متوافق مع الـ Enum
CREATE OR REPLACE FUNCTION public.create_order_with_items(
    p_guest_name text,
    p_guest_phone text,
    p_guest_backup_phone text,
    p_guest_city text,
    p_guest_street text,
    p_guest_address_detail text,
    p_customer_notes text,
    p_payment_method text,
    p_total_amount numeric,
    p_tracking_number text,
    p_items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id uuid;
    v_user_id uuid;
    v_item jsonb;
BEGIN
    -- التحقق من هوية المستخدم المسجل
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'يرجى تسجيل الدخول لإتمام الطلب.';
    END IF;

    -- إدخال الطلب الرئيسي مع تحويل نوع وسيلة الدفع بشكل صريح ليتوافق مع الـ Enum
    INSERT INTO public.orders (
        customer_id,
        guest_name,
        guest_phone,
        guest_backup_phone,
        guest_city,
        guest_street,
        guest_address_detail,
        customer_notes,
        status,
        payment_method,
        total_amount,
        tracking_number
    ) VALUES (
        v_user_id,
        p_guest_name,
        p_guest_phone,
        coalesce(p_guest_backup_phone, ''),
        p_guest_city,
        p_guest_street,
        coalesce(p_guest_address_detail, ''),
        coalesce(p_customer_notes, ''),
        'new', -- الحالة الافتراضية للطلب
        coalesce(p_payment_method, 'cash_on_delivery')::payment_method, -- هنا التحويل الصريح لنوع الـ Enum
        p_total_amount,
        p_tracking_number
    )
    RETURNING id INTO v_order_id;

    -- إدخال عناصر الطلب
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_name,
            product_image,
            quantity,
            price_at_purchase,
            item_mode
        ) VALUES (
            v_order_id,
            (v_item->>'product_id')::uuid,
            v_item->>'product_name',
            coalesce(v_item->>'product_image', ''),
            (v_item->>'quantity')::integer,
            (v_item->>'price_at_purchase')::numeric,
            coalesce(v_item->>'item_mode', 'sale')
        );
    END LOOP;

    RETURN v_order_id;
END;
$$;

-- 3. إنشاء دالة سحابية آمنة (SECURITY DEFINER) لجلب قائمة العملاء للإدارة وتخطي RLS برمز المرور 9922
CREATE OR REPLACE FUNCTION public.admin_get_customer_profiles(
    p_passcode text
)
RETURNS TABLE (
    id uuid,
    name text,
    phone text,
    backup_phone text,
    city text,
    street text,
    additional_address text,
    is_admin boolean,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- التحقق من رمز مرور الإدارة 9922
    IF p_passcode != '9922' THEN
        RAISE EXCEPTION 'غير مصرح بالدخول للإدارة.';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.phone,
        p.backup_phone,
        p.city,
        p.street,
        p.additional_address,
        p.is_admin,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    ORDER BY p.created_at DESC;
END;
$$;

-- 4. إعداد وتحديث سياسات أمان الـ RLS لجدول الحسابات (profiles) للتأكد من قدرة المستخدمين على إنشاء وتحديث حساباتهم
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public profile insert during auth" ON public.profiles;
CREATE POLICY "Allow public profile insert during auth" ON public.profiles
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
CREATE POLICY "Allow users to view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())));

DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())));

DROP POLICY IF EXISTS "Allow admins complete control over profiles" ON public.profiles;
CREATE POLICY "Allow admins complete control over profiles" ON public.profiles
    FOR ALL USING (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()));

-- 5. إعادة بناء وضمان عمل زناد إنشاء الحسابات التلقائي (Trigger) عند تسجيل مستخدم جديد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, backup_phone, city, street, additional_address, is_admin)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'زبون جديد'),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'backup_phone', ''),
    coalesce(new.raw_user_meta_data ->> 'city', 'طرابلس'),
    coalesce(new.raw_user_meta_data ->> 'street', ''),
    coalesce(new.raw_user_meta_data ->> 'additional_address', ''),
    coalesce((new.raw_user_meta_data ->> 'is_admin')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      backup_phone = EXCLUDED.backup_phone,
      city = EXCLUDED.city,
      street = EXCLUDED.street,
      additional_address = EXCLUDED.additional_address;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. إرسال تنبيه فوري لخادم PostgREST لتحديث الكاش والتعرف على التغييرات فوراً
SELECT pg_notify('pgrst', 'reload schema');
