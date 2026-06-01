
-- جاغوار occasions - Seed data
-- شغّلي هذا الملف بعد إنشاء مستخدم الأدمن في Supabase Auth بنفس الإيميل.

insert into public.admins (email, role, is_active)
values ('Tahacabello3@gmail.com', 'owner', true)
on conflict (email) do update set role = excluded.role, is_active = true;

insert into public.categories (name, slug, sort_order, is_active) values
('كيبان التخرج', 'graduation-gowns', 1, true),
('قبعات التخرج', 'graduation-caps', 2, true),
('شالات التخرج', 'graduation-sashes', 3, true),
('بروشات التخرج', 'graduation-pins', 4, true),
('إكسسوارات التصوير', 'photo-accessories', 5, true)
on conflict (slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order,
    is_active = true;

insert into public.whatsapp_numbers (label, phone, is_primary, is_active, sort_order) values
('الرقم الأساسي', '0921544663', true, true, 1),
('واتساب إضافي', '0925813109', false, true, 2),
('واتساب إضافي', '0927561171', false, true, 3);

insert into public.site_settings (key, value) values
('site_name', 'جاغوار occasions'),
('map_url', 'https://maps.app.goo.gl/rHFoqjEkFh5nqBnw7'),
('address_text', ''),
('facebook_url', 'https://www.facebook.com/share/1J1wcwMvat/'),
('instagram_url', 'https://www.instagram.com/jaguaroccasions?igsh=MWZlenRoZnk5djRjbg=='),
('rental_policy', 'الاستلام قبل يوم المناسبة بيوم، والإرجاع بعد التخرج بيوم.')
on conflict (key) do update set value = excluded.value;
