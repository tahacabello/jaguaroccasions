-- =====================================================================
-- 🎓 جاغوار للمناسبات — حل مشكلة مزامنة وصلاحيات قاعدة البيانات (Supabase RLS Fix)
-- =====================================================================
--
-- المشكلة: بما أن الموقع مبني كصفحة ثابتة (Serverless Static) ويعمل بلوحة تحكم
-- أدمن محلية تعتمد على الـ Anon Key الخاص بـ Supabase، فإن سياسات الأمان RLS
-- تمنع أي شخص غير مسجل الدخول بريدياً (Unauthenticated) من تعديل أو إضافة منتجات.
--
-- الحل: قم بنسخ هذا الكود بالكامل ولصقه داخل محرر SQL (SQL Editor) في لوحة تحكم
-- Supabase الخاصة بك، ثم اضغط على زر RUN لتنفيذه وحل المشكلة فوراً!
--
-- =====================================================================

-- 1. الخيار الأول والأكثر استقراراً للمواقع الثابتة: إيقاف الـ RLS مؤقتاً
-- هذا يسمح للوحة الأدمن المثبتة لديك بتعديل وحفظ البيانات مباشرة باستخدام مفتاح الـ Anon.
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- 2. في حال رغبتك بإبقاء RLS مفعلة، يمكنك تشغيل السياسات التالية للسماح بالوصول العام (العام المشروط):
-- (إذا قمت بتشغيل الأوامر السابقة، فهذا الجزء اختياري ولكنه إضافي للأمان)

-- السماح للجميع بالكتابة وتحديث المنتجات
DROP POLICY IF EXISTS "Allow public insert products" ON public.products;
CREATE POLICY "Allow public insert products" ON public.products 
FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update products" ON public.products;
CREATE POLICY "Allow public update products" ON public.products 
FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete products" ON public.products;
CREATE POLICY "Allow public delete products" ON public.products 
FOR DELETE TO anon, authenticated USING (true);

-- السماح للجميع بتحديث الأقسام
DROP POLICY IF EXISTS "Allow public insert categories" ON public.categories;
CREATE POLICY "Allow public insert categories" ON public.categories 
FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update categories" ON public.categories;
CREATE POLICY "Allow public update categories" ON public.categories 
FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete categories" ON public.categories;
CREATE POLICY "Allow public delete categories" ON public.categories 
FOR DELETE TO anon, authenticated USING (true);

-- السماح للجميع بتحديث إعدادات الموقع
DROP POLICY IF EXISTS "Allow public manage settings" ON public.site_settings;
CREATE POLICY "Allow public manage settings" ON public.site_settings 
FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
