-- =====================================================================
-- 🎓 جاغوار للمناسبات — إعداد بناء الصفحة الرئيسية الديناميكي (Homepage Builder)
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل محرر SQL (SQL Editor) في لوحة تحكم Supabase

-- 1. إنشاء جدول الأقسام الرئيسية في الصفحة (homepage_sections)
CREATE TABLE IF NOT EXISTS public.homepage_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    subtitle text,
    image_url text,
    is_visible boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    section_type text NOT NULL DEFAULT 'mixed', -- 'categories', 'subcategories', 'products', 'mixed'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. إنشاء جدول العناصر داخل الأقسام (homepage_section_items)
CREATE TABLE IF NOT EXISTS public.homepage_section_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id uuid NOT NULL REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
    display_title text,
    display_subtitle text,
    display_image_url text,
    linked_type text NOT NULL, -- 'category', 'subcategory', 'product'
    linked_id uuid NOT NULL,
    is_visible boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. تفعيل الحماية على مستوى الصفوف (RLS)
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_section_items ENABLE ROW LEVEL SECURITY;

-- 4. إعطاء الصلاحيات اللازمة للزوار والأدمن
GRANT SELECT ON public.homepage_sections TO anon, authenticated;
GRANT ALL ON public.homepage_sections TO authenticated;

GRANT SELECT ON public.homepage_section_items TO anon, authenticated;
GRANT ALL ON public.homepage_section_items TO authenticated;

-- 5. سياسات الأمان لـ homepage_sections
DROP POLICY IF EXISTS "Allow public select visible homepage_sections" ON public.homepage_sections;
CREATE POLICY "Allow public select visible homepage_sections" ON public.homepage_sections
    FOR SELECT USING (is_visible = true OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())));

DROP POLICY IF EXISTS "Allow admins insert homepage_sections" ON public.homepage_sections;
CREATE POLICY "Allow admins insert homepage_sections" ON public.homepage_sections
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admins update homepage_sections" ON public.homepage_sections;
CREATE POLICY "Allow admins update homepage_sections" ON public.homepage_sections
    FOR UPDATE USING (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()))
    WITH CHECK (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admins delete homepage_sections" ON public.homepage_sections;
CREATE POLICY "Allow admins delete homepage_sections" ON public.homepage_sections
    FOR DELETE USING (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()));

-- 6. سياسات الأمان لـ homepage_section_items
DROP POLICY IF EXISTS "Allow public select visible homepage_section_items" ON public.homepage_section_items;
CREATE POLICY "Allow public select visible homepage_section_items" ON public.homepage_section_items
    FOR SELECT USING (is_visible = true OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())));

DROP POLICY IF EXISTS "Allow admins insert homepage_section_items" ON public.homepage_section_items;
CREATE POLICY "Allow admins insert homepage_section_items" ON public.homepage_section_items
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admins update homepage_section_items" ON public.homepage_section_items;
CREATE POLICY "Allow admins update homepage_section_items" ON public.homepage_section_items
    FOR UPDATE USING (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()))
    WITH CHECK (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admins delete homepage_section_items" ON public.homepage_section_items;
CREATE POLICY "Allow admins delete homepage_section_items" ON public.homepage_section_items
    FOR DELETE USING (auth.uid() IS NOT NULL AND public.is_admin(auth.uid()));
