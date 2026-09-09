-- ============================================================
-- SEGURIDAD DE BASE DE DATOS
-- ============================================================

-- ============================================================
-- 1. RLS
-- ============================================================

alter table public.productos enable row level security;
alter table public.compradores enable row level security;
alter table public.ventas enable row level security;
alter table public.detalle_ventas enable row level security;


-- ============================================================
-- 2. POLÍTICAS DE PRODUCTOS
-- ============================================================

-- El catálogo público solamente puede consultar productos activos.
create policy "productos_publico_ver_activos"
on public.productos
for select
to anon
using (activo = true);

-- Los administradores pueden gestionar completamente los productos.
create policy "productos_admin_gestion"
on public.productos
for all
to authenticated
using (public.es_usuario_admin())
with check (public.es_usuario_admin());


-- ============================================================
-- 3. POLÍTICAS DE COMPRADORES
-- ============================================================

-- Solamente administradores pueden consultar compradores.
create policy "compradores_admin_consulta"
on public.compradores
for select
to authenticated
using (public.es_usuario_admin());


-- ============================================================
-- 4. POLÍTICAS DE VENTAS
-- ============================================================

-- Solamente administradores pueden consultar ventas.
create policy "ventas_admin_consulta"
on public.ventas
for select
to authenticated
using (public.es_usuario_admin());


-- ============================================================
-- 5. POLÍTICAS DE DETALLE DE VENTAS
-- ============================================================

-- Solamente administradores pueden consultar los detalles.
create policy "detalle_ventas_admin_consulta"
on public.detalle_ventas
for select
to authenticated
using (public.es_usuario_admin());


-- ============================================================
-- 6. PRIVILEGIOS DE TABLAS
-- ============================================================

-- Productos:
-- público puede leer;
-- usuarios autenticados pueden ejecutar CRUD,
-- pero RLS decidirá si realmente son administradores.
revoke all on table public.productos from anon;
revoke all on table public.productos from authenticated;

grant select on table public.productos to anon;

grant select, insert, update, delete
on table public.productos
to authenticated;


-- Datos sensibles:
-- ningún usuario anónimo puede acceder directamente.
revoke all on table public.compradores from anon;
revoke all on table public.ventas from anon;
revoke all on table public.detalle_ventas from anon;

-- Los autenticados tienen SELECT, pero RLS limita
-- el acceso exclusivamente a administradores.
grant select on table public.compradores to authenticated;
grant select on table public.ventas to authenticated;
grant select on table public.detalle_ventas to authenticated;


-- ============================================================
-- 7. FUNCIONES DEL DASHBOARD
-- ============================================================

-- Las funciones dejan de ejecutarse con privilegios elevados.
-- Ahora respetan los permisos y las políticas RLS del usuario
-- que las invoca.
alter function public.obtener_ingresos_totales()
security invoker;

alter function public.obtener_top_clientes()
security invoker;

alter function public.obtener_stock_bajo()
security invoker;

alter function public.obtener_productos_mas_vendidos()
security invoker;


-- ============================================================
-- 8. PROTEGER EJECUCIÓN DE RPC
-- ============================================================

-- Nadie puede ejecutar estas funciones por defecto.
revoke execute
on function public.obtener_ingresos_totales()
from public;

revoke execute
on function public.obtener_top_clientes()
from public;

revoke execute
on function public.obtener_stock_bajo()
from public;

revoke execute
on function public.obtener_productos_mas_vendidos()
from public;


-- Solamente usuarios autenticados pueden llamar al dashboard.
grant execute
on function public.obtener_ingresos_totales()
to authenticated;

grant execute
on function public.obtener_top_clientes()
to authenticated;

grant execute
on function public.obtener_stock_bajo()
to authenticated;

grant execute
on function public.obtener_productos_mas_vendidos()
to authenticated;


-- ============================================================
-- 9. VENTA PÚBLICA
-- ============================================================

-- registrar_venta DEBE seguir disponible para visitantes
-- porque el catálogo permite comprar sin iniciar sesión.
grant execute
on function public.registrar_venta(
    bigint,
    integer,
    character varying,
    character varying
)
to anon, authenticated;