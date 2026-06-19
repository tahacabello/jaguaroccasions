-- =====================================================================
-- 🎓 جاغوار للمناسبات — ترقية عناصر الطلب لإضافة خيارات التخصيص والجدولة الفردية
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل محرر SQL (SQL Editor) في لوحة تحكم Supabase

-- 1. إضافة الأعمدة إلى جدول عناصر المبيعات (order_items)
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS pickup_date text;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS return_date text;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS is_preliminary boolean DEFAULT false;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS customization_type text;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS layer_type text;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS color_sash text;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS color_text text;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS custom_text text;

-- 2. إضافة الأعمدة إلى جدول عناصر الحجوزات (reservation_items)
ALTER TABLE public.reservation_items ADD COLUMN IF NOT EXISTS pickup_date text;
ALTER TABLE public.reservation_items ADD COLUMN IF NOT EXISTS return_date text;
ALTER TABLE public.reservation_items ADD COLUMN IF NOT EXISTS is_preliminary boolean DEFAULT false;
ALTER TABLE public.reservation_items ADD COLUMN IF NOT EXISTS customization_type text;
ALTER TABLE public.reservation_items ADD COLUMN IF NOT EXISTS layer_type text;
ALTER TABLE public.reservation_items ADD COLUMN IF NOT EXISTS color_sash text;
ALTER TABLE public.reservation_items ADD COLUMN IF NOT EXISTS color_text text;
ALTER TABLE public.reservation_items ADD COLUMN IF NOT EXISTS custom_text text;

-- 3. إضافة الأعمدة إلى جدول عناصر الإيجارات (rental_items)
ALTER TABLE public.rental_items ADD COLUMN IF NOT EXISTS pickup_date text;
ALTER TABLE public.rental_items ADD COLUMN IF NOT EXISTS return_date text;
ALTER TABLE public.rental_items ADD COLUMN IF NOT EXISTS is_preliminary boolean DEFAULT false;
ALTER TABLE public.rental_items ADD COLUMN IF NOT EXISTS customization_type text;
ALTER TABLE public.rental_items ADD COLUMN IF NOT EXISTS layer_type text;
ALTER TABLE public.rental_items ADD COLUMN IF NOT EXISTS color_sash text;
ALTER TABLE public.rental_items ADD COLUMN IF NOT EXISTS color_text text;
ALTER TABLE public.rental_items ADD COLUMN IF NOT EXISTS custom_text text;

-- 4. إعادة إنشاء دالة إنشاء الطلب السحابية لتخزين تفاصيل التخصيص وجدولة العناصر
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
        'new', -- الحالة الافتراضية
        coalesce(p_payment_method, 'cash_on_delivery')::payment_method,
        p_total_amount,
        p_tracking_number,
        p_event_date,
        p_pickup_date,
        p_return_date,
        p_is_preliminary
    )
    RETURNING id INTO v_order_id;

    -- إدخال عناصر وتفاصيل الطلب مع خيارات التخصيص
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_name,
            product_image,
            quantity,
            price_at_purchase,
            item_mode,
            pickup_date,
            return_date,
            is_preliminary,
            customization_type,
            layer_type,
            color_sash,
            color_text,
            custom_text
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
            coalesce(v_item->>'item_mode', 'sale'),
            v_item->>'pickup_date',
            v_item->>'return_date',
            coalesce((v_item->>'is_preliminary')::boolean, false),
            v_item->>'customization_type',
            v_item->>'layer_type',
            v_item->>'color_sash',
            v_item->>'color_text',
            v_item->>'custom_text'
        );
    END LOOP;

    RETURN v_order_id;
END;
$$;

-- 5. إرسال تنبيه فوري لتنشيط التغييرات فوراً
SELECT pg_notify('pgrst', 'reload schema');
