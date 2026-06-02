-- =====================================================================
-- 🎓 جاغوار للمناسبات — إصلاح نوع حقل حالة الطلب (Order Status Type Fix)
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل محرر SQL (SQL Editor) في لوحة تحكم Supabase
-- لتحويل حقل الحالة إلى نص عادي ليدعم جميع حالات الطلب ديناميكياً وبدون قيود الـ Enum.

-- 1. إزالة القيمة الافتراضية مؤقتاً لتغيير النوع
ALTER TABLE public.orders ALTER COLUMN status DROP DEFAULT;

-- 2. تحويل نوع الحقل status إلى نص (text)
ALTER TABLE public.orders ALTER COLUMN status TYPE text;

-- 3. إعادة تعيين القيمة الافتراضية الصحيحة لتكون 'new_order'
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'new_order';

-- 4. إرسال تنبيه فوري لخادم PostgREST لتحديث الكاش والتعرف على التغييرات فوراً
SELECT pg_notify('pgrst', 'reload schema');
