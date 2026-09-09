-- ============================================================
-- PERMITIR CATÁLOGO PÚBLICO A USUARIOS AUTENTICADOS
-- ============================================================

drop policy if exists "productos_publico_ver_activos"
on public.productos;

create policy "productos_publico_ver_activos"
on public.productos
for select
to anon, authenticated
using (activo = true);