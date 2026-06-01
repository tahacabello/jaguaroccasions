-- =====================================================================
-- 🎓 جاغوار للمناسبات — ترقية هيكلية الأقسام والفرعيات للتحكم الكامل
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل ولصقه داخل محرر SQL (SQL Editor) في لوحة تحكم
-- Supabase الخاصة بك، ثم اضغط على زر RUN لتنفيذه وتفعيل الهيكلية الجديدة!
-- =====================================================================

-- 1. إضافة عمود التميز بالرئيسية (is_featured) لجدول الأقسام الرئيسية
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- 2. إضافة أعمدة الصورة والوصف والتميز بالرئيسية لجدول الأقسام الفرعية
ALTER TABLE public.subcategories ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE public.subcategories ADD COLUMN IF NOT EXISTS "desc" text;
ALTER TABLE public.subcategories ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- 3. منح الصلاحيات الكاملة للأدمن والزوار لضمان عمل لوحة التحكم بسلاسة
GRANT ALL ON TABLE public.categories TO anon, authenticated;
GRANT ALL ON TABLE public.subcategories TO anon, authenticated;

-- 4. إيقاف سياسات الـ RLS لجدول الفرعيات لتمكين الـ CRUD الفوري للأدمن
ALTER TABLE public.subcategories DISABLE ROW LEVEL SECURITY;
