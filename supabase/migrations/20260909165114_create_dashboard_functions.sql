-- Ingresos totales
CREATE OR REPLACE FUNCTION public.obtener_ingresos_totales()
RETURNS NUMERIC(12,2)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(SUM(total), 0)::NUMERIC(12,2)
    FROM public.ventas;
$$;


-- Top de clientes por cantidad de compras
CREATE OR REPLACE FUNCTION public.obtener_top_clientes()
RETURNS TABLE (
    nombre_completo VARCHAR(70),
    email VARCHAR(150),
    cantidad_compras BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        c.nombre_completo,
        c.email,
        COUNT(v.id) AS cantidad_compras
    FROM public.compradores c
    INNER JOIN public.ventas v
        ON v.comprador_id = c.id
    GROUP BY
        c.id,
        c.nombre_completo,
        c.email
    ORDER BY cantidad_compras DESC, c.nombre_completo ASC
    LIMIT 5;
$$;


-- Productos con stock bajo
CREATE OR REPLACE FUNCTION public.obtener_stock_bajo()
RETURNS TABLE (
    id BIGINT,
    nombre VARCHAR(70),
    stock INTEGER,
    imagen_url TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        p.id,
        p.nombre,
        p.stock,
        p.imagen_url
    FROM public.productos p
    WHERE p.activo = TRUE
      AND p.stock < 5
    ORDER BY p.stock ASC, p.nombre ASC;
$$;


-- Top 5 productos más vendidos
CREATE OR REPLACE FUNCTION public.obtener_productos_mas_vendidos()
RETURNS TABLE (
    producto_id BIGINT,
    nombre VARCHAR(70),
    unidades_vendidas BIGINT,
    ingresos NUMERIC(12,2)
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        p.id AS producto_id,
        p.nombre,
        SUM(dv.cantidad)::BIGINT AS unidades_vendidas,
        SUM(dv.subtotal)::NUMERIC(12,2) AS ingresos
    FROM public.detalle_ventas dv
    INNER JOIN public.productos p
        ON p.id = dv.producto_id
    INNER JOIN public.ventas v
        ON v.id = dv.venta_id
    GROUP BY
        p.id,
        p.nombre
    ORDER BY
        unidades_vendidas DESC,
        ingresos DESC,
        p.nombre ASC
    LIMIT 5;
$$;