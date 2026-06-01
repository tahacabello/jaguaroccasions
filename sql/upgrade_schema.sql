-- =====================================================================
-- 🎓 جاغوار للمناسبات — ترقية هيكلية قاعدة البيانات الشاملة مع سياسات الأمان الـ RLS والتخزين السحابي والصلاحيات
-- =====================================================================
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل محرر SQL (SQL Editor) في لوحة تحكم Supabase
-- لتجهيز وتحديث جميع الجداول وسياسات الأمان والحقول المطلوبة تلقائياً!
-- =====================================================================

-- 1. تفعيل الإضافات اللازمة
create extension if not exists "uuid-ossp";

-- 2. جدول الحسابات والتسجيل للزبائن (Profiles / Customers)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  phone text not null,
  backup_phone text,
  city text not null,
  street text not null,
  additional_address text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- تمكين تعديل الحسابات تلقائياً عند التسجيل بـ Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone, city, street, additional_address, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'زبون جديد'),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'city', 'طرابلس'),
    coalesce(new.raw_user_meta_data ->> 'street', ''),
    coalesce(new.raw_user_meta_data ->> 'additional_address', ''),
    coalesce((new.raw_user_meta_data ->> 'is_admin')::boolean, false)
  );
  return new;
end;
$$ language plpgsql security definer;

-- إعداد الزناد (Trigger)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. جدول الأقسام الرئيسية (Categories)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image text,
  desc text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4. جدول الأقسام الفرعية (Subcategories)
create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5. جدول المنتجات (Products)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  name text not null,
  code text not null unique,
  description text,
  rent_price numeric(12,2),
  sale_price numeric(12,2),
  currency text not null default 'LYD',
  image text, -- صورة الغلاف الرئيسية
  images text[] default '{}', -- مصفوفة روابط الصور الإضافية (معرض الصور)
  stock_quantity integer not null default 10,
  status text not null default 'available', -- ('available', 'reserved', 'sold_out', 'hidden', 'featured')
  is_featured boolean not null default false,
  is_hidden boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. جدول طلبات الشراء والحجوزات (Orders)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  guest_name text not null,
  guest_phone text not null,
  guest_backup_phone text,
  guest_city text not null,
  guest_street text not null,
  guest_address_detail text,
  customer_notes text,
  status text not null default 'new_order', -- ('new_order', 'waiting_confirmation', 'confirmed', 'preparing', 'ready', 'reserved', 'completed', 'cancelled')
  payment_method text not null default 'cash_on_delivery',
  total_amount numeric(12,2) not null,
  tracking_number text unique not null,
  created_at timestamptz not null default now()
);

-- 7. جدول تفاصيل عناصر الطلب (Order Items)
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  quantity integer not null default 1,
  price_at_purchase numeric(12,2) not null,
  item_mode text not null default 'sale', -- ('sale', 'rent')
  created_at timestamptz not null default now()
);

-- 8. جدول إعدادات الموقع بالكامل (Settings)
create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 🔒 تفعيل وتكوين سياسات الأمان الـ RLS (Row Level Security)
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.settings enable row level security;

-- دوال مساعدة للتحقق من صلاحية الأدمن
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and is_admin = true
  );
end;
$$ language plpgsql security definer;

-- سياسات Profiles
create policy "Allow public profile insert during auth" on public.profiles
  for insert with check (true);

create policy "Allow users to view own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "Allow users to update own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "Allow admins complete control over profiles" on public.profiles
  for all using (public.is_admin(auth.uid()));

-- سياسات Categories
create policy "Allow public to view active categories" on public.categories
  for select using (is_active = true or public.is_admin(auth.uid()));

create policy "Allow admins control over categories" on public.categories
  for all using (public.is_admin(auth.uid()));

-- سياسات Subcategories
create policy "Allow public to view active subcategories" on public.subcategories
  for select using (is_active = true or public.is_admin(auth.uid()));

create policy "Allow admins control over subcategories" on public.subcategories
  for all using (public.is_admin(auth.uid()));

-- سياسات Products
create policy "Allow public to view active products" on public.products
  for select using (is_hidden = false or public.is_admin(auth.uid()));

create policy "Allow admins control over products" on public.products
  for all using (public.is_admin(auth.uid()));

-- سياسات Orders
create policy "Allow anyone to insert orders" on public.orders
  for insert with check (true);

create policy "Allow customers to view own orders" on public.orders
  for select using (auth.uid() = customer_id or public.is_admin(auth.uid()));

create policy "Allow admins control over orders" on public.orders
  for all using (public.is_admin(auth.uid()));

-- سياسات Order Items
create policy "Allow anyone to insert order items" on public.order_items
  for insert with check (true);

create policy "Allow customers to view own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id 
      and (orders.customer_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

create policy "Allow admins control over order items" on public.order_items
  for all using (public.is_admin(auth.uid()));

-- سياسات Settings
create policy "Allow public to view settings" on public.settings
  for select using (true);

create policy "Allow admins control over settings" on public.settings
  for all using (public.is_admin(auth.uid()));

-- =====================================================================
-- 🔐 منح الصلاحيات الصريحة لأدوار Supabase (Postgres Table Grants)
-- =====================================================================

grant usage on schema public to anon, authenticated;

-- صلاحيات الجداول للأعضاء والزوار
grant select on table public.categories to anon, authenticated;
grant select on table public.subcategories to anon, authenticated;
grant select on table public.products to anon, authenticated;
grant select on table public.settings to anon, authenticated;

grant insert on table public.orders to anon, authenticated;
grant insert on table public.order_items to anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select on table public.orders to authenticated;
grant select on table public.order_items to authenticated;

-- صلاحيات الجداول الكاملة للمسؤولين
grant all on table public.profiles to authenticated;
grant all on table public.categories to authenticated;
grant all on table public.subcategories to authenticated;
grant all on table public.products to authenticated;
grant all on table public.orders to authenticated;
grant all on table public.order_items to authenticated;
grant all on table public.settings to authenticated;

-- =====================================================================
-- 📦 إعدادات التخزين السحابي (Supabase Storage) والمحافظ
-- =====================================================================

-- إنشاء محفظة صور المنتجات 'product-images' إذا لم تكن موجودة
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- سياسة السماح للجميع بقراءة الصور
create policy "Allow public read access to product-images" on storage.objects
  for select using (bucket_id = 'product-images');

-- سياسة السماح للأدمن برفع وحذف وتعديل الصور في المحفظة
create policy "Allow admins full control over product-images" on storage.objects
  for all using (
    bucket_id = 'product-images' 
    and public.is_admin(auth.uid())
  );
