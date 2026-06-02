-- =====================================================================
-- 🎓 جاغوار للمناسبات — إصلاح علاقة العميل بجدول الطلبات (Customer Foreign Key Fix)
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل محرر SQL (SQL Editor) في لوحة تحكم Supabase
-- لتغيير مرجعية معرف العميل لترتبط مباشرة بجدول المستخدمين المعتمدين في Supabase Auth
-- مما يضمن عدم حدوث أي أخطاء عند إتمام الطلب حتى لو لم يتم إنشاء الملف الشخصي بعد.

-- 1. إزالة قيد مفتاح الربط الأجنبي القديم
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;

-- 2. إعادة إنشاء قيد الربط الأجنبي ليرتبط بجدول auth.users(id) مباشرة بدلاً من البروفايل
ALTER TABLE public.orders 
  ADD CONSTRAINT orders_customer_id_fkey 
  FOREIGN KEY (customer_id) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- 3. إرسال تنبيه فوري لخادم PostgREST لتحديث الكاش والتعرف على التغييرات فوراً
SELECT pg_notify('pgrst', 'reload schema');
