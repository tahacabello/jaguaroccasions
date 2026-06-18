-- =====================================================================
-- 🎓 جاغوار للمناسبات — إضافة أعمدة العربون والمتبقي للمبيعات المباشرة
-- =====================================================================
-- قم بنسخ هذا الكود وتشغيله داخل محرر SQL (SQL Editor) في لوحة تحكم Supabase لتحديث الجداول

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deposit numeric(12, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS remaining numeric(12, 2) DEFAULT 0;

-- إرسال تنبيه لتحديث ذاكرة التخزين المؤقت للمخطط فوراً
SELECT pg_notify('pgrst', 'reload schema');
