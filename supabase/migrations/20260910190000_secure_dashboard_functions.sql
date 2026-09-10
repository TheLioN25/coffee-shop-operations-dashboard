-- ============================================================
-- SEGURIDAD DE FUNCIONES DEL DASHBOARD
-- ============================================================

alter function public.obtener_ingresos_totales()
security invoker;

alter function public.obtener_top_clientes()
security invoker;

alter function public.obtener_stock_bajo()
security invoker;

alter function public.obtener_productos_mas_vendidos()
security invoker;

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