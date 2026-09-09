-- ============================================================
-- CORRECCIÓN DE PRIVILEGIOS DE RPC DEL DASHBOARD
-- ============================================================

revoke execute
on function public.obtener_ingresos_totales()
from anon;

revoke execute
on function public.obtener_top_clientes()
from anon;

revoke execute
on function public.obtener_stock_bajo()
from anon;

revoke execute
on function public.obtener_productos_mas_vendidos()
from anon;


-- Solo usuarios autenticados pueden invocar las funciones.
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