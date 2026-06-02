-- =====================================================================
-- 🎓 جاغوار للمناسبات — ترقية جدول الطلبيات ودعم سياسات وتواريخ الإيجار (Rental Dates Upgrade)
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل محرر SQL (SQL Editor) في لوحة تحكم Supabase

-- 1. إضافة الأعمدة الجديدة لجدول الطلبات لدعم الإيجار وتواريخ المناسبات والحجز المبدئي
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS event_date text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pickup_date text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS return_date text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_preliminary boolean DEFAULT false;

-- 2. تحديث دالة إدخال الطلب لتشمل معاملات تواريخ الاستلام والتسليم والحجز المبدئي
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
    p_items jsonb,
    p_event_date text DEFAULT NULL,
    p_pickup_date text DEFAULT NULL,
    p_return_date text DEFAULT NULL,
    p_is_preliminary boolean DEFAULT false
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

    -- إدخال الطلب الرئيسي
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
        tracking_number,
        event_date,
        pickup_date,
        return_date,
        is_preliminary
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
        coalesce(p_payment_method, 'cash_on_delivery')::payment_method,
        p_total_amount,
        p_tracking_number,
        p_event_date,
        p_pickup_date,
        p_return_date,
        p_is_preliminary
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
            CASE 
                WHEN v_item->>'product_id' ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' 
                THEN (v_item->>'product_id')::uuid 
                ELSE NULL 
            END,
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

-- 3. تحديث دالة الإدارة لتسمح للأدمن بالتعديل الكامل على تواريخ الإيجار والحجز المبدئي
CREATE OR REPLACE FUNCTION public.admin_update_order_details(
    p_order_id uuid,
    p_guest_name text,
    p_guest_phone text,
    p_guest_backup_phone text,
    p_guest_city text,
    p_guest_street text,
    p_guest_address_detail text,
    p_customer_notes text,
    p_total_amount numeric,
    p_status text,
    p_passcode text,
    p_event_date text DEFAULT NULL,
    p_pickup_date text DEFAULT NULL,
    p_return_date text DEFAULT NULL,
    p_is_preliminary boolean DEFAULT false
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

    UPDATE public.orders
    SET guest_name = p_guest_name,
        guest_phone = p_guest_phone,
        guest_backup_phone = coalesce(p_guest_backup_phone, ''),
        guest_city = p_guest_city,
        guest_street = p_guest_street,
        guest_address_detail = coalesce(p_guest_address_detail, ''),
        customer_notes = coalesce(p_customer_notes, ''),
        total_amount = p_total_amount,
        status = p_status,
        event_date = p_event_date,
        pickup_date = p_pickup_date,
        return_date = p_return_date,
        is_preliminary = p_is_preliminary,
        updated_at = now()
    WHERE id = p_order_id;

    RETURN true;
END;
$$;

-- 4. إرسال تنبيه فوري لتنشيط التغييرات فوراً
SELECT pg_notify('pgrst', 'reload schema');
