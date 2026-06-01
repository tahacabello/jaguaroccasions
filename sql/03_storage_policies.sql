
-- جاغوار occasions - Storage bucket and policies
-- شغّلي هذا الملف بعد 02_rls_policies.sql.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'jaguar-media',
  'jaguar-media',
  true,
  8388608,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = true,
    file_size_limit = 8388608,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

drop policy if exists "Public can read jaguar media" on storage.objects;
create policy "Public can read jaguar media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'jaguar-media');

drop policy if exists "Admins can upload jaguar media" on storage.objects;
create policy "Admins can upload jaguar media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'jaguar-media' and public.is_admin());

drop policy if exists "Admins can update jaguar media" on storage.objects;
create policy "Admins can update jaguar media"
on storage.objects
for update
to authenticated
using (bucket_id = 'jaguar-media' and public.is_admin())
with check (bucket_id = 'jaguar-media' and public.is_admin());

drop policy if exists "Admins can delete jaguar media" on storage.objects;
create policy "Admins can delete jaguar media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'jaguar-media' and public.is_admin());
