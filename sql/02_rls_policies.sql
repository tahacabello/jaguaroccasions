
-- جاغوار occasions - RLS policies
-- شغّلي هذا الملف بعد 01_tables.sql.

alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.whatsapp_numbers enable row level security;
alter table public.hero_slides enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Admins can view admins" on public.admins;
create policy "Admins can view admins"
on public.admins
for select
to authenticated
using (public.is_admin());

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read visible products" on public.products;
create policy "Public can read visible products"
on public.products
for select
to anon, authenticated
using (is_hidden = false and is_archived = false);

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read images of visible products" on public.product_images;
create policy "Public can read images of visible products"
on public.product_images
for select
to anon, authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.products p
    where p.id = product_images.product_id
      and p.is_hidden = false
      and p.is_archived = false
  )
);

drop policy if exists "Admins can manage product images" on public.product_images;
create policy "Admins can manage product images"
on public.product_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read active whatsapp numbers" on public.whatsapp_numbers;
create policy "Public can read active whatsapp numbers"
on public.whatsapp_numbers
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Admins can manage whatsapp numbers" on public.whatsapp_numbers;
create policy "Admins can manage whatsapp numbers"
on public.whatsapp_numbers
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read active hero slides" on public.hero_slides;
create policy "Public can read active hero slides"
on public.hero_slides
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Admins can manage hero slides" on public.hero_slides;
create policy "Admins can manage hero slides"
on public.hero_slides
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
on public.site_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can read audit logs" on public.audit_logs;
create policy "Admins can read audit logs"
on public.audit_logs
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert audit logs" on public.audit_logs;
create policy "Admins can insert audit logs"
on public.audit_logs
for insert
to authenticated
with check (public.is_admin());
