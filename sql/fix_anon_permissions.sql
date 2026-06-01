-- =====================================================================
-- 🎓 جاغوار للمناسبات — منح الصلاحيات الكاملة لدور anon لتشغيل لوحة التحكم الساكنة بالكامل
-- =====================================================================
-- المشكلة: بما أن الموقع يعمل كصفحة ثابتة (Serverless Static) ويستخدم مفتاح الـ Anon Key
-- للاتصال مباشرة بقاعدة البيانات، فإن قاعدة بيانات Postgres تمنع دور (anon) من تعديل
-- أو حفظ البيانات في جدول الأقسام (Categories) وتظهر رسالة "permission denied".
--
-- الحل: قم بنسخ هذا الكود بالكامل ولصقه داخل محرر SQL (SQL Editor) في لوحة تحكم
-- Supabase الخاصة بك، ثم اضغط على زر RUN لتنفيذه وحل المشكلة فوراً!
-- =====================================================================

-- 1. منح الصلاحيات الكاملة لدور anon و authenticated على جميع جداول لوحة التحكم
GRANT ALL ON TABLE public.categories TO anon, authenticated;
GRANT ALL ON TABLE public.subcategories TO anon, authenticated;
GRANT ALL ON TABLE public.products TO anon, authenticated;
GRANT ALL ON TABLE public.settings TO anon, authenticated;
GRANT ALL ON TABLE public.orders TO anon, authenticated;
GRANT ALL ON TABLE public.order_items TO anon, authenticated;
GRANT ALL ON TABLE public.profiles TO anon, authenticated;

-- 2. إيقاف الـ Row Level Security (RLS) مؤقتاً لضمان تشغيل لوحة التحكم بالكامل بدون قيود جلسة
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. منح الصلاحيات الكاملة على جميع المتتاليات (Sequences) لتفادي أخطاء الـ ID التلقائي
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
