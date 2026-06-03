-- =====================================================================
-- 📜 جاغوار للمناسبات — نظام طلبات إلغاء الطلبيات (Order Cancellation Requests Schema)
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل محرر SQL (SQL Editor) في لوحة تحكم Supabase.

-- 1. إضافة حقل حالة طلب الإلغاء لجدول الطلبيات
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancellation_status text DEFAULT NULL;

-- 2. دالة لطلب إلغاء الطلب من طرف الزبون
-- يجب أن يكون الطلب تابعاً للمستخدم الحالي، وألا تكون حالته ملغية أو مكتملة بالفعل.
CREATE OR REPLACE FUNCTION public.request_order_cancellation(p_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
  SET cancellation_status = 'pending'
  WHERE id = p_order_id 
    AND (customer_id = auth.uid() OR public.is_admin(auth.uid()))
    AND status NOT IN ('cancelled', 'completed');
    
  RETURN FOUND;
END;
$$;

-- 3. دالة قبول الإلغاء من طرف الإدارة
-- تتطلب رمز مرور المسؤول وتغير حالة الطلب إلى ملغي (cancelled) وحالة الإلغاء إلى مقبول (approved).
CREATE OR REPLACE FUNCTION public.approve_order_cancellation(p_order_id uuid, p_passcode text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- التحقق من رمز مرور المسؤول
  IF p_passcode != '9922' THEN
    RAISE EXCEPTION 'غير مصرح بالدخول للإدارة.';
  END IF;

  UPDATE public.orders
  SET cancellation_status = 'approved',
      status = 'cancelled'
  WHERE id = p_order_id;
  
  RETURN FOUND;
END;
$$;

-- 4. دالة رفض الإلغاء من طرف الإدارة
-- تتطلب رمز مرور المسؤول وتغير حالة الإلغاء إلى مرفوض (rejected) مع إبقاء حالة الطلب كما هي.
CREATE OR REPLACE FUNCTION public.reject_order_cancellation(p_order_id uuid, p_passcode text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- التحقق من رمز مرور المسؤول
  IF p_passcode != '9922' THEN
    RAISE EXCEPTION 'غير مصرح بالدخول للإدارة.';
  END IF;

  UPDATE public.orders
  SET cancellation_status = 'rejected'
  WHERE id = p_order_id;
  
  RETURN FOUND;
END;
$$;

-- 5. منح صلاحيات التنفيذ لجميع الأدوار
GRANT EXECUTE ON FUNCTION public.request_order_cancellation(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_order_cancellation(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reject_order_cancellation(uuid, text) TO anon, authenticated;

-- 6. تنشيط التغييرات وتحديث المخطط
SELECT pg_notify('pgrst', 'reload schema');
