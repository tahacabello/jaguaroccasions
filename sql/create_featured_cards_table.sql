-- =====================================================================
-- 🎓 جاغوار للمناسبات — تهيئة جدول الأقسام المميزة وتأمين سياسات الـ RLS
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل ولصقه داخل محرر SQL (SQL Editor) في لوحة تحكم
-- Supabase الخاصة بك، ثم اضغط على زر RUN لتنفيذه وتفعيل الحماية الجديدة!
-- =====================================================================

-- 1. إنشاء جدول بطاقات الأقسام المميزة بالصفحة الرئيسية
CREATE TABLE IF NOT EXISTS public.featured_cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    display_title text,
    display_subtitle text,
    display_image_url text,
    linked_type text NOT NULL, -- 'category' أو 'subcategory'
    linked_id uuid NOT NULL,
    is_visible boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. تفعيل سياسات الأمان لحماية الجدول
ALTER TABLE public.featured_cards ENABLE ROW LEVEL SECURITY;

-- 3. منح صلاحية القراءة للجميع وصلاحية التعديل للحسابات المسجلة
GRANT SELECT ON public.featured_cards TO anon, authenticated;
GRANT ALL ON public.featured_cards TO authenticated;

-- 4. سياسة القراءة للزوار والعامة (المنشورة فقط)
DROP POLICY IF EXISTS "Allow public to view visible featured cards" ON public.featured_cards;
CREATE POLICY "Allow public to view visible featured cards" ON public.featured_cards
    FOR SELECT USING (is_visible = true OR public.is_admin(auth.uid()));

-- 5. سياسة التحكم الكامل لمديري الموقع المعتمدين فقط
DROP POLICY IF EXISTS "Allow admins control over featured cards" ON public.featured_cards;
CREATE POLICY "Allow admins control over featured cards" ON public.featured_cards
    FOR ALL USING (public.is_admin(auth.uid()));
