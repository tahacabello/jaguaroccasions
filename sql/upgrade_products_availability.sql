-- =====================================================================
-- 🎓 جاغوار للمناسبات — ترقية هيكلية وجدول المنتجات والأسعار وحالات التوفر (Products Availability Upgrade)
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل محرر SQL (SQL Editor) في لوحة تحكم Supabase
-- =====================================================================

-- 1. تفعيل مكتبة التشفير وتوليد المعرفات الفرعية
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. إعداد معرف المنتج الفريد ليتولد تلقائياً في حال عدم إرساله من الواجهة
ALTER TABLE public.products ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2.5 السماح بحقول الأسعار أن تكون فارغة لدعم خيارات البيع فقط أو الإيجار فقط
ALTER TABLE public.products ALTER COLUMN price_sale DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN price_rent DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN sale_price DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN rent_price DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN category DROP NOT NULL;

-- 3. إضافة عمود نوع الخدمة (item_mode) للتحكم بالبيع أو الإيجار أو كلاهما
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS item_mode text NOT NULL DEFAULT 'both';

-- 4. إضافة قيد التحقق (CHECK Constraint) لضمان حفظ القيم الصحيحة فقط لـ item_mode
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_item_mode_check;
ALTER TABLE public.products ADD CONSTRAINT products_item_mode_check CHECK (item_mode IN ('both', 'sale', 'rent'));

-- 5. تنظيف وتوحيد حالات المنتجات القديمة المخزنة بالعربية وتحويلها لمعرفات مستقرة بالإنجليزية
UPDATE public.products SET status = 'available' WHERE status = 'متوفر';
UPDATE public.products SET status = 'unavailable' WHERE status = 'غير متوفر' OR status = 'غير متوفر حالياً';
UPDATE public.products SET status = 'reserved' WHERE status = 'محجوز';
UPDATE public.products SET status = 'sold' WHERE status = 'مباع';
UPDATE public.products SET status = 'hidden' WHERE status = 'مخفي';

-- 6. إعادة تحميل الهيكل البرمجي لـ Supabase لتنشيط الحقول فوراً
SELECT pg_notify('pgrst', 'reload schema');
