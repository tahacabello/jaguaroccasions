-- ==========================================
-- منظومة «جاغوار» للإدارة الداخلية - سكريبت تهيئة قاعدة البيانات
-- ==========================================

-- تفعيل ملحق توليد معرفات UUID تلقائياً
create extension if not exists pgcrypto;

-- 1. جدول الإعدادات العامة (Settings)
create table if not exists public.settings (
    key text primary key,
    value text,
    updated_at timestamptz default now()
);

-- إدخال الإعدادات الافتراضية
insert into public.settings (key, value) values
('store_name', 'جاغوار للمناسبات'),
('admin_pin', '9922'),
('theme_primary', '#d4af37'), -- لون ذهبي
('theme_dark_mode', 'true'),
('print_header', 'جاغوار للمناسبات - طرابلس'),
('print_footer', 'شكراً لتعاملكم معنا')
on conflict (key) do nothing;

-- 2. جدول العملاء (Customers)
create table if not exists public.customers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    whatsapp text,
    phone text,
    address text,
    id_type text, -- نوع إثبات الهوية (بطاقة شخصية، جواز سفر، إلخ)
    id_name text, -- الاسم المدون في الهوية
    created_at timestamptz default now()
);

-- 3. جدول المنتجات (Products)
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    image text,
    code text unique not null,
    barcode text unique not null,
    category text not null, -- كاب، قبعة، شال، اكسسوارات التخرج، بروش، طباعة شال، تطريز شال
    size text,
    colors text,
    notes text,
    quantity integer default 1,
    status text default 'available', -- available, reserved, rented, unavailable
    price_sale numeric(12, 2) default 0,
    price_rent numeric(12, 2) default 0,
    item_mode text default 'both', -- sale, rent, both
    
    -- حقول إضافية خاصة بالشالات (طباعة، تطريز، شال)
    is_edged boolean default false, -- هل الشال بحواف أو بدون حواف
    layer_type text, -- ثنائي أو ثلاثي
    fabric_type text, -- نوع القماش
    color_sash text, -- لون الشال
    color_print text, -- لون الطباعة
    color_embroidery text, -- لون التطريز
    
    created_at timestamptz default now()
);

-- 4. جدول الحجوزات (Reservations)
create table if not exists public.reservations (
    id uuid primary key default gen_random_uuid(),
    reservation_number text unique not null,
    customer_id uuid references public.customers(id) on delete cascade,
    start_date date not null,
    pickup_date date not null,
    return_date date not null,
    total_amount numeric(12, 2) default 0,
    deposit numeric(12, 2) default 0,
    remaining numeric(12, 2) default 0,
    payment_status text default 'unpaid', -- paid, partial, unpaid
    status text default 'active', -- active, cancelled, completed
    notes text,
    delivery_method text default 'store_pickup', -- store_pickup, delivery
    created_at timestamptz default now()
);

-- جدول عناصر الحجوزات (Reservation Items)
create table if not exists public.reservation_items (
    id uuid primary key default gen_random_uuid(),
    reservation_id uuid references public.reservations(id) on delete cascade,
    product_id text references public.products(id) on delete cascade,
    quantity integer default 1,
    price numeric(12, 2) default 0
);

-- 5. جدول الإيجارات (Rentals)
create table if not exists public.rentals (
    id uuid primary key default gen_random_uuid(),
    operation_number text unique not null,
    customer_id uuid references public.customers(id) on delete cascade,
    start_date date not null,
    end_date date not null,
    actual_delivery_date date,
    expected_return_date date not null,
    actual_return_date date,
    rental_value numeric(12, 2) default 0,
    deposit numeric(12, 2) default 0,
    remaining numeric(12, 2) default 0,
    status text default 'rented', -- rented, returned, late
    return_status text default 'not_returned', -- returned_clean, returned_damaged, not_returned
    notes text,
    delay_fine numeric(12, 2) default 0,
    created_at timestamptz default now()
);

-- جدول عناصر الإيجارات (Rental Items)
create table if not exists public.rental_items (
    id uuid primary key default gen_random_uuid(),
    rental_id uuid references public.rentals(id) on delete cascade,
    product_id text references public.products(id) on delete cascade,
    quantity integer default 1,
    price numeric(12, 2) default 0
);

-- 6. جدول البيوعات المباشرة (Orders)
create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    order_number text unique not null,
    customer_id uuid references public.customers(id) on delete cascade,
    total_amount numeric(12, 2) default 0,
    payment_status text default 'paid', -- paid, unpaid, partial
    status text default 'completed', -- completed, cancelled
    notes text,
    created_at timestamptz default now()
);

-- جدول عناصر المبيعات (Order Items)
create table if not exists public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references public.orders(id) on delete cascade,
    product_id text references public.products(id) on delete cascade,
    quantity integer default 1,
    price numeric(12, 2) default 0
);

-- 7. جدول حركات المدفوعات (Payments)
create table if not exists public.payments (
    id uuid primary key default gen_random_uuid(),
    amount numeric(12, 2) not null,
    date date not null default current_date,
    movement_type text not null, -- cash, transfer, partial, deposit, final_payment, refund
    linked_operation_type text, -- reservation, rental, order
    linked_operation_id uuid, -- رقم معرف العملية المرتبط بها
    notes text,
    payment_status text default 'completed', -- completed, pending, refunded
    created_at timestamptz default now()
);

-- 8. جدول عمليات التسليم (Deliveries)
create table if not exists public.deliveries (
    id uuid primary key default gen_random_uuid(),
    linked_operation_type text not null, -- reservation, rental
    linked_operation_id uuid not null,
    delivery_date date not null default current_date,
    notes text,
    status text default 'delivered', -- delivered, pending
    created_at timestamptz default now()
);

-- 9. جدول عمليات الإرجاع (Returns)
create table if not exists public.returns (
    id uuid primary key default gen_random_uuid(),
    linked_operation_type text not null, -- reservation, rental
    linked_operation_id uuid not null,
    return_date date not null default current_date,
    notes text,
    status text default 'returned', -- returned, pending
    created_at timestamptz default now()
);

-- 10. جدول التنبيهات والإشعارات (Notifications)
create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    type text not null, -- due_soon, late_delivery, late_return, unpaid_balance, reservation_alert
    title text not null,
    message text not null,
    is_read boolean default false,
    linked_operation_type text,
    linked_operation_id uuid,
    created_at timestamptz default now()
);

-- 11. جدول سجل العمليات والرقابة (Activity Logs)
create table if not exists public.activity_logs (
    id uuid primary key default gen_random_uuid(),
    action_by text default 'المالك',
    action_type text not null, -- add, edit, delete
    table_name text not null,
    record_id uuid,
    details jsonb,
    created_at timestamptz default now()
);

-- ==========================================
-- إعداد الصلاحيات والأمان (Permissions & RLS)
-- بما أن المنظومة خاصة بالمالك فقط وتعمل عبر متصفحه مباشرة، سنقوم بتبسيط السياسات
-- ==========================================

-- تفعيل RLS على الجداول
alter table public.settings enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.reservations enable row level security;
alter table public.reservation_items enable row level security;
alter table public.rentals enable row level security;
alter table public.rental_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.deliveries enable row level security;
alter table public.returns enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

-- إنشاء سياسة عامة تسمح لجميع الحركات للمستخدم المجهول (Anon) والمسجل (Authenticated)
-- لأن الاتصال قادم من واجهة مستخدم خاصة ومحمي برمز PIN
create policy "Allow all for anon on settings" on public.settings for all using (true) with check (true);
create policy "Allow all for anon on customers" on public.customers for all using (true) with check (true);
create policy "Allow all for anon on products" on public.products for all using (true) with check (true);
create policy "Allow all for anon on reservations" on public.reservations for all using (true) with check (true);
create policy "Allow all for anon on reservation_items" on public.reservation_items for all using (true) with check (true);
create policy "Allow all for anon on rentals" on public.rentals for all using (true) with check (true);
create policy "Allow all for anon on rental_items" on public.rental_items for all using (true) with check (true);
create policy "Allow all for anon on orders" on public.orders for all using (true) with check (true);
create policy "Allow all for anon on order_items" on public.order_items for all using (true) with check (true);
create policy "Allow all for anon on payments" on public.payments for all using (true) with check (true);
create policy "Allow all for anon on deliveries" on public.deliveries for all using (true) with check (true);
create policy "Allow all for anon on returns" on public.returns for all using (true) with check (true);
create policy "Allow all for anon on notifications" on public.notifications for all using (true) with check (true);
create policy "Allow all for anon on activity_logs" on public.activity_logs for all using (true) with check (true);

-- إعطاء الصلاحيات الكاملة للـ Anon والـ Authenticated
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
