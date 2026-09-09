create policy "productos_storage_admin_insert"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'productos'
    and public.es_usuario_admin()
);

create policy "productos_storage_admin_update"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'productos'
    and public.es_usuario_admin()
)
with check (
    bucket_id = 'productos'
    and public.es_usuario_admin()
);

create policy "productos_storage_admin_delete"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'productos'
    and public.es_usuario_admin()
);