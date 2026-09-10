-- ============================================================
-- GESTOR DE CLIENTES
-- Funciones para consulta de clientes e historial de compras
-- ============================================================


-- ============================================================
-- 1. LISTADO DE CLIENTES
-- ============================================================

CREATE OR REPLACE FUNCTION public.obtener_clientes()
RETURNS TABLE (
    id BIGINT,
    nombre_completo VARCHAR(70),
    email VARCHAR(150),
    cantidad_compras BIGINT,
    total_gastado NUMERIC(12,2),
    ultima_compra TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        c.id,
        c.nombre_completo,
        c.email,
        COUNT(v.id) AS cantidad_compras,
        COALESCE(SUM(v.total), 0)::NUMERIC(12,2) AS total_gastado,
        MAX(v.fecha_creacion) AS ultima_compra
    FROM public.compradores c
    LEFT JOIN public.ventas v
        ON v.comprador_id = c.id
    GROUP BY
        c.id,
        c.nombre_completo,
        c.email
    ORDER BY
        c.nombre_completo ASC;
$$;


-- ============================================================
-- 2. HISTORIAL DE COMPRAS DE UN CLIENTE
-- ============================================================

CREATE OR REPLACE FUNCTION public.obtener_historial_cliente(
    p_cliente_id BIGINT
)
RETURNS TABLE (
    venta_id BIGINT,
    fecha_compra TIMESTAMPTZ,
    producto_id BIGINT,
    producto_nombre VARCHAR(70),
    cantidad INTEGER,
    precio_unitario NUMERIC(10,2),
    subtotal NUMERIC(10,2),
    total_venta NUMERIC(10,2)
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        v.id AS venta_id,
        v.fecha_creacion AS fecha_compra,
        p.id AS producto_id,
        p.nombre AS producto_nombre,
        dv.cantidad,
        dv.precio_unitario,
        dv.subtotal,
        v.total AS total_venta
    FROM public.ventas v
    INNER JOIN public.detalle_ventas dv
        ON dv.venta_id = v.id
    INNER JOIN public.productos p
        ON p.id = dv.producto_id
    WHERE v.comprador_id = p_cliente_id
    ORDER BY
        v.fecha_creacion DESC,
        v.id DESC,
        p.nombre ASC;
$$;


-- ============================================================
-- 3. SEGURIDAD
-- ============================================================

REVOKE EXECUTE
ON FUNCTION public.obtener_clientes()
FROM public;

REVOKE EXECUTE
ON FUNCTION public.obtener_clientes()
FROM anon;

GRANT EXECUTE
ON FUNCTION public.obtener_clientes()
TO authenticated;


REVOKE EXECUTE
ON FUNCTION public.obtener_historial_cliente(BIGINT)
FROM public;

REVOKE EXECUTE
ON FUNCTION public.obtener_historial_cliente(BIGINT)
FROM anon;

GRANT EXECUTE
ON FUNCTION public.obtener_historial_cliente(BIGINT)
TO authenticated;