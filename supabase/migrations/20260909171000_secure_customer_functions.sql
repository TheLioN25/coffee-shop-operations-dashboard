-- ============================================================
-- SEGURIDAD DEL GESTOR DE CLIENTES
-- Las funciones deben respetar las políticas RLS del usuario
-- que realiza la consulta.
-- ============================================================

ALTER FUNCTION public.obtener_clientes()
SECURITY INVOKER;

ALTER FUNCTION public.obtener_historial_cliente(BIGINT)
SECURITY INVOKER;
