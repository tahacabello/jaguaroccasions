-- =====================================================================
-- 🎓 جاغوار للمناسبات — ترقية نظام الدفع وقائمة العملاء وتجاوز الـ RLS للإدارة
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل محرر SQL (SQL Editor) في لوحة تحكم Supabase.

-- 1. التأكد من وجود قيمة 'cash_on_delivery' في نوع الـ Enum (payment_method) بشكل آمن دون أخطاء
ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'cash_on_delivery';

-- 2. ترقية جدول الحسابات (profiles) وتثبيت الأعمدة الإضافية المفقودة
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS backup_phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS street text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS additional_address text;

-- 3. تأمين وتأكيد علاقة الربط الأجنبي للطلبات لتكون ON DELETE SET NULL لحماية تاريخ المبيعات
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE public.orders 
  ADD CONSTRAINT orders_customer_id_fkey 
  FOREIGN KEY (customer_id) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- 4. إعداد دالة إدخال الطلب المحدثة لتقوم بتحويل نوع وسيلة الدفع (Casting) بشكل صحيح متوافق مع الـ Enum
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

-- 5. إسقاط الدالة السابقة أولاً لتجنب خطأ تعارض توقيع الإرجاع في PostgreSQL
DROP FUNCTION IF EXISTS public.admin_get_customer_profiles(text);

-- 6. إنشاء دالة استعلام آمنة للإدارة لجلب العملاء مع تفاصيل البريد الإلكتروني والعناوين الكاملة
CREATE OR REPLACE FUNCTION public.admin_get_customer_profiles(
    p_passcode text
)
RETURNS TABLE (
    id uuid,
    first_name text,
    last_name text,
    phone_number text,
    backup_phone text,
    city text,
    street text,
    additional_address text,
    is_admin boolean,
    created_at timestamptz,
    updated_at timestamptz,
    email text
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
        p.first_name,
        p.last_name,
        p.phone_number,
        p.backup_phone,
        p.city,
        p.street,
        p.additional_address,
        p.is_admin,
        p.created_at,
        p.updated_at,
        u.email::text
    FROM public.profiles p
    LEFT JOIN auth.users u ON p.id = u.id
    ORDER BY p.created_at DESC;
END;
$$;

-- 7. إنشاء دالة سحابية آمنة للإدارة لتحديث بيانات البروفايل للزبون برمز التحقق 9922
CREATE OR REPLACE FUNCTION public.admin_update_customer_profile(
    p_user_id uuid,
    p_first_name text,
    p_last_name text,
    p_phone_number text,
    p_backup_phone text,
    p_city text,
    p_street text,
    p_additional_address text,
    p_passcode text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_passcode != '9922' THEN
        RAISE EXCEPTION 'غير مصرح بالدخول للإدارة.';
    END IF;

    UPDATE public.profiles
    SET first_name = p_first_name,
        last_name = p_last_name,
        phone_number = p_phone_number,
        backup_phone = p_backup_phone,
        city = p_city,
        street = p_street,
        additional_address = p_additional_address,
        updated_at = now()
    WHERE id = p_user_id;

    RETURN true;
END;
$$;

-- 8. إنشاء دالة سحابية آمنة كاحتياطي لحذف حساب العميل بالكامل من النظام والـ Auth برمز التحقق 9922
CREATE OR REPLACE FUNCTION public.admin_delete_customer(
    p_user_id uuid,
    p_passcode text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_passcode != '9922' THEN
        RAISE EXCEPTION 'غير مصرح بالدخول للإدارة.';
    END IF;

    -- حذف العميل من جدول auth.users (سيقوم تلقائياً بمسح البروفايل وضبط customer_id بالطلبات ليكون NULL)
    DELETE FROM auth.users WHERE id = p_user_id;

    -- التأكيد الإضافي للحذف من البروفايل
    DELETE FROM public.profiles WHERE id = p_user_id;

    RETURN true;
END;
$$;

-- 9. إعداد وتحديث سياسات أمان الـ RLS لجدول الحسابات (profiles) للتأكد من قدرة المستخدمين على إنشاء وتحديث حساباتهم
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

-- 10. إعادة بناء وضمان عمل زناد إنشاء الحسابات التلقائي (Trigger) عند تسجيل مستخدم جديد ليتوافق مع الحقول الإضافية المحدثة
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone_number, backup_phone, city, street, additional_address, is_admin)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', split_part(new.raw_user_meta_data ->> 'name', ' ', 1)),
    coalesce(new.raw_user_meta_data ->> 'last_name', substr(new.raw_user_meta_data ->> 'name', strpos(new.raw_user_meta_data ->> 'name', ' ') + 1)),
    coalesce(new.raw_user_meta_data ->> 'phone_number', new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'backup_phone', ''),
    coalesce(new.raw_user_meta_data ->> 'city', 'طرابلس'),
    coalesce(new.raw_user_meta_data ->> 'street', ''),
    coalesce(new.raw_user_meta_data ->> 'additional_address', ''),
    coalesce((new.raw_user_meta_data ->> 'is_admin')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE
  SET first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      phone_number = EXCLUDED.phone_number,
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

-- 11. إرسال تنبيه فوري لخادم PostgREST لتحديث الكاش والتعرف على التغييرات فوراً
SELECT pg_notify('pgrst', 'reload schema');
