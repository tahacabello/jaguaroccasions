-- =====================================================================
-- 🎓 جاغوار للمناسبات — إعداد وترقية تفاصيل الطلبيات وسياسات الشراء (Checkout Fix)
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل محرر SQL (SQL Editor) في لوحة تحكم Supabase

-- 1. التأكد من وجود كافة الأعمدة المطلوبة في جدول الطلبات (orders)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_phone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_backup_phone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_city text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_street text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_address_detail text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_notes text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status text DEFAULT 'new_order';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cash_on_delivery';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount numeric(12,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text;

-- 2. تفعيل سياسات الأمان الـ RLS لجدول الطلبات (orders)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anyone to insert orders" ON public.orders;
CREATE POLICY "Allow anyone to insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow customers to view own orders" ON public.orders;
CREATE POLICY "Allow customers to view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = customer_id OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())));

DROP POLICY IF EXISTS "Allow admins control over orders" ON public.orders;
CREATE POLICY "Allow admins control over orders" ON public.orders
    FOR ALL USING (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()));

-- 3. تفعيل سياسات الأمان الـ RLS لجدول تفاصيل الطلب (order_items)
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anyone to insert order items" ON public.order_items;
CREATE POLICY "Allow anyone to insert order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public/admins select order items" ON public.order_items;
CREATE POLICY "Allow public/admins select order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
              AND (o.customer_id = auth.uid() OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())))
        )
    );

-- 4. إرسال تنبيه فوري لخادم PostgREST لتحديث الكاش والتعرف على الأعمدة الجديدة فوراً
SELECT pg_notify('pgrst', 'reload schema');
