-- =====================================================================
-- 🎓 جاغوار للمناسبات — إعداد وترقية تفاصيل الطلبيات والدوال السحابية وسياسات RLS المتقدمة
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل محرر SQL (SQL Editor) في لوحة تحكم Supabase
-- لتفعيل حماية الـ RLS بالكامل وتجهيز الدوال السحابية المؤمنة برمز المرور الجديد 9922.

-- 1. التأكد من وجود عمود التحديث التلقائي في جدول الطلبات (orders)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. إعداد دالة وزناد لتحديث التوقيت تلقائياً عند أي تعديل
CREATE OR REPLACE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. تفعيل وإعداد سياسات الحماية الصارمة الـ RLS لجداول الطلبات والتفاصيل
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة لضمان عدم وجود أي تعارض
DROP POLICY IF EXISTS "Allow anyone to insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow customers to view own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow select own or admin orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admins control over orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin delete orders" ON public.orders;

DROP POLICY IF EXISTS "Allow anyone to insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public/admins select order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow customers to view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow select own or admin order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow admins control over order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow admin update order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow admin delete order items" ON public.order_items;

-- سياسات جدول الطلبات (orders)
-- أ. السماح للأعضاء المسجلين فقط بإدخال طلباتهم الخاصة
CREATE POLICY "Allow authenticated insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND customer_id = auth.uid());

-- ب. السماح للأعضاء برؤية طلباتهم وللأدمن برؤية الجميع
CREATE POLICY "Allow select own or admin orders" ON public.orders
    FOR SELECT USING (
        (auth.role() = 'authenticated' AND customer_id = auth.uid())
        OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()))
    );

-- ج. السماح للأدمن بتحديث وحذف الطلبات
CREATE POLICY "Allow admin update orders" ON public.orders
    FOR UPDATE USING (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()))
    WITH CHECK (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()));

CREATE POLICY "Allow admin delete orders" ON public.orders
    FOR DELETE USING (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()));


-- سياسات جدول تفاصيل عناصر الطلب (order_items)
-- أ. السماح للأعضاء بإدخال عناصر تابعة لطلبهم الخاص
CREATE POLICY "Allow authenticated insert own order items" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
              AND o.customer_id = auth.uid()
        )
    );

-- ب. السماح للأعضاء برؤية عناصر طلباتهم ولالأدمن برؤية الجميع
CREATE POLICY "Allow select own or admin order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
              AND (o.customer_id = auth.uid() OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())))
        )
    );

-- ج. السماح للأدمن بتحديث وحذف عناصر الطلبات
CREATE POLICY "Allow admin update order items" ON public.order_items
    FOR UPDATE USING (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()))
    WITH CHECK (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()));

CREATE POLICY "Allow admin delete order items" ON public.order_items
    FOR DELETE USING (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()));


-- 4. إعداد الدوال السحابية المعرفة (RPC SECURITY DEFINER) للعمليات الآمنة وتخطي قيود الـ RLS للأدمن والعمليات المعقدة

-- أ. دالة إدخال الطلب الكامل مع عناصره معاً بشكل متكامل وتأكيد الحماية
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
        'new', -- الحالة الافتراضية المستقرة الجديدة
        coalesce(p_payment_method, 'cash_on_delivery')::payment_method,
        p_total_amount,
        p_tracking_number
    )
    RETURNING id INTO v_order_id;

    -- إدخال عناصر وتفاصيل الطلب في حلقة تكرارية
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


-- ب. دالة تحديث حالة الطلبية من الإدارة برمز التحقق الجديد 9922
CREATE OR REPLACE FUNCTION public.admin_update_order_status(
    p_order_id uuid,
    p_status text,
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

    UPDATE public.orders
    SET status = p_status,
        updated_at = now()
    WHERE id = p_order_id;

    RETURN true;
END;
$$;


-- ج. دالة تحديث كامل تفاصيل وبيانات الطلبية من الإدارة برمز التحقق الجديد 9922
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
        updated_at = now()
    WHERE id = p_order_id;

    RETURN true;
END;
$$;


-- د. دالة حذف الطلبية بالكامل من الإدارة برمز التحقق الجديد 9922
CREATE OR REPLACE FUNCTION public.admin_delete_order(
    p_order_id uuid,
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

    DELETE FROM public.orders
    WHERE id = p_order_id;

    RETURN true;
END;
$$;


-- 5. إرسال تنبيه فوري لخادم PostgREST لتحديث الكاش والتعرف على الجداول والتغييرات فوراً
SELECT pg_notify('pgrst', 'reload schema');
