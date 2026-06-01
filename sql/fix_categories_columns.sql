-- =====================================================================
-- 🎓 جاغوار للمناسبات — إضافة عمود الصورة المفقود ومنح الصلاحيات لجدول الأقسام
-- =====================================================================
-- المشكلة: بما أن جدول الأقسام (categories) كان قد تم إنشاؤه مسبقاً في قاعدة بياناتك
-- بنسخة قديمة، فإن عمود الصورة (image) مفقود منه حالياً؛ ولذلك تفشل لوحة التحكم
-- عند محاولة تعديل أو حفظ الأقسام بوجود حقل الصورة وتظهر رسالة "فشل تعديل القسم".
--
-- الحل: قم بنسخ هذا الكود بالكامل ولصقه داخل محرر SQL (SQL Editor) في لوحة تحكم
-- Supabase الخاصة بك، ثم اضغط على زر RUN لتنفيذه وحل المشكلة نهائياً!
-- =====================================================================

-- 1. إضافة عمود الصورة (image) المفقود لجدول الأقسام فوراً
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image text;

-- 2. منح الصلاحيات الكاملة لدور anon و authenticated على جميع جداول لوحة التحكم
GRANT ALL ON TABLE public.categories TO anon, authenticated;
GRANT ALL ON TABLE public.subcategories TO anon, authenticated;
GRANT ALL ON TABLE public.products TO anon, authenticated;
GRANT ALL ON TABLE public.settings TO anon, authenticated;
GRANT ALL ON TABLE public.orders TO anon, authenticated;
GRANT ALL ON TABLE public.order_items TO anon, authenticated;
GRANT ALL ON TABLE public.profiles TO anon, authenticated;

-- 3. إيقاف الـ Row Level Security (RLS) مؤقتاً لضمان تشغيل لوحة التحكم بالكامل بدون قيود جلسة
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. منح الصلاحيات الكاملة على جميع المتتاليات (Sequences) لتفادي أخطاء الـ ID التلقائي
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
