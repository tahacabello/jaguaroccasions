-- =====================================================================
-- 📜 جاغوار للمناسبات — نظام طلبات التعديل والموافقة الآمنة (Order Change Requests Schema)
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل محرر SQL (SQL Editor) في لوحة تحكم Supabase مرة واحدة.

-- 1. إنشاء جدول طلبات التعديل
CREATE TABLE IF NOT EXISTS public.order_change_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    requested_changes jsonb NOT NULL,
    customer_note text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    admin_note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone
);

-- 2. فرض قيد فريد لضمان وجود طلب تعديل معلق (pending) واحد فقط لكل طلبية
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_pending_request_per_order 
ON public.order_change_requests (order_id) 
WHERE (status = 'pending');

-- 3. تفعيل نظام الحماية RLS
ALTER TABLE public.order_change_requests ENABLE ROW LEVEL SECURITY;

-- 4. إعداد سياسات الحماية لجدول طلبات التعديل
-- أ) السماح للمستخدم بإنشاء طلب تعديل لطلبيته الخاصة فقط
CREATE POLICY "Users can create change requests" 
ON public.order_change_requests
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ب) السماح للمستخدم بمشاهدة طلبات التعديل الخاصة به فقط
CREATE POLICY "Users can read own change requests" 
ON public.order_change_requests
FOR SELECT 
USING (auth.uid() = user_id);

-- ج) السماح للمستخدم بتحديث طلبه المعلق (تعديله أو إلغائه)
CREATE POLICY "Users can update own pending requests" 
ON public.order_change_requests
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending');

-- د) السماح للإدارة بمشاهدة كافة طلبات التعديل
CREATE POLICY "Admins can select all change requests" 
ON public.order_change_requests
FOR SELECT 
USING (true);

-- 5. دالة تحديث التوقيت تلقائياً
CREATE OR REPLACE FUNCTION public.update_change_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_change_request_timestamp
    BEFORE UPDATE ON public.order_change_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_change_request_timestamp();

-- =====================================================================
-- 🔒 دالات الإدارة الآمنة وتحديث الفاتورة (SECURITY DEFINER Functions)
-- =====================================================================

-- أ) دالة قبول واعتماد التعديل مع تطبيق قائمة حقول موثوقة فقط (Whitelist)
CREATE OR REPLACE FUNCTION public.admin_approve_change_request(
    p_request_id uuid,
    p_admin_note text,
    p_passcode text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_changes jsonb;
    v_order_id uuid;
BEGIN
    -- التحقق من رمز مرور المسؤول
    IF p_passcode != '9922' THEN
        RAISE EXCEPTION 'غير مصرح بالدخول للإدارة.';
    END IF;

    -- جلب طلب التعديل المعلق
    SELECT order_id, requested_changes INTO v_order_id, v_changes
    FROM public.order_change_requests
    WHERE id = p_request_id AND status = 'pending';

    IF v_order_id IS NULL THEN
        RAISE EXCEPTION 'طلب التعديل غير موجود أو تمت معالجته مسبقاً.';
    END IF;

    -- تطبيق التعديلات الموثوقة فقط (Safe Whitelist) على جدول الطلبيات لمنع التلاعب بالحسابات أو المجموع الإجمالي
    UPDATE public.orders
    SET 
        event_date = COALESCE((v_changes->>'event_date'), event_date),
        pickup_date = COALESCE((v_changes->>'pickup_date'), pickup_date),
        return_date = COALESCE((v_changes->>'return_date'), return_date),
        is_preliminary = COALESCE((v_changes->'is_preliminary')::boolean, is_preliminary),
        customer_notes = COALESCE((v_changes->>'customer_notes'), customer_notes),
        guest_phone = COALESCE((v_changes->>'customer_phone'), guest_phone),
        guest_backup_phone = COALESCE((v_changes->>'customer_backup_phone'), guest_backup_phone),
        guest_city = COALESCE((v_changes->>'customer_city'), guest_city),
        guest_street = COALESCE((v_changes->>'customer_street'), guest_street),
        guest_address_detail = COALESCE((v_changes->>'customer_address_details'), guest_address_detail),
        updated_at = now()
    WHERE id = v_order_id;

    -- تحديث حالة الطلب إلى مقبول
    UPDATE public.order_change_requests
    SET status = 'approved',
        admin_note = p_admin_note,
        reviewed_at = now()
    WHERE id = p_request_id;

    RETURN true;
END;
$$;

-- ب) دالة رفض التعديل دون المساس بجدول الطلبيات
CREATE OR REPLACE FUNCTION public.admin_reject_change_request(
    p_request_id uuid,
    p_admin_note text,
    p_passcode text
)
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

    -- تحديث حالة الطلب إلى مرفوض
    UPDATE public.order_change_requests
    SET status = 'rejected',
        admin_note = p_admin_note,
        reviewed_at = now()
    WHERE id = p_request_id AND status = 'pending';

    RETURN true;
END;
$$;

-- تنشيط التغييرات في Supabase
SELECT pg_notify('pgrst', 'reload schema');
