-- ============================================================
-- FUNCIÓN PARA REGISTRAR UNA VENTA
-- ============================================================

CREATE OR REPLACE FUNCTION public.registrar_venta(
    p_producto_id BIGINT,
    p_cantidad INTEGER,
    p_nombre_completo VARCHAR(70),
    p_email VARCHAR(150)
)
RETURNS TABLE (
    venta_id BIGINT,
    total NUMERIC(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_comprador_id BIGINT;
    v_precio NUMERIC(10,2);
    v_stock INTEGER;
    v_subtotal NUMERIC(10,2);
    v_iva NUMERIC(10,2);
    v_total NUMERIC(10,2);
    v_venta_id BIGINT;
BEGIN

    -- Validaciones básicas
    IF p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad debe ser mayor que cero.';
    END IF;

    IF p_nombre_completo IS NULL OR TRIM(p_nombre_completo) = '' THEN
        RAISE EXCEPTION 'El nombre completo es obligatorio.';
    END IF;

    IF p_email IS NULL OR TRIM(p_email) = '' THEN
        RAISE EXCEPTION 'El email es obligatorio.';
    END IF;

    -- Buscar o crear comprador
    INSERT INTO compradores (
        nombre_completo,
        email
    )
    VALUES (
        TRIM(p_nombre_completo),
        LOWER(TRIM(p_email))
    )
    ON CONFLICT (email)
    DO UPDATE SET
        nombre_completo = EXCLUDED.nombre_completo
    RETURNING id INTO v_comprador_id;

    -- Bloquear el producto durante la operación
    SELECT
        precio,
        stock
    INTO
        v_precio,
        v_stock
    FROM productos
    WHERE id = p_producto_id
      AND activo = TRUE
    FOR UPDATE;

    -- Verificar que exista
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El producto no existe o no está disponible.';
    END IF;

    -- Verificar stock
    IF v_stock < p_cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente. Disponible: %, solicitado: %.',
            v_stock,
            p_cantidad;
    END IF;

    -- Calcular valores de la venta
    v_subtotal := ROUND(v_precio * p_cantidad, 2);
    v_iva := ROUND(v_subtotal * 0.19, 2);
    v_total := v_subtotal + v_iva;

    -- Crear venta
    INSERT INTO ventas (
        comprador_id,
        subtotal,
        iva,
        total
    )
    VALUES (
        v_comprador_id,
        v_subtotal,
        v_iva,
        v_total
    )
    RETURNING id INTO v_venta_id;

    -- Crear detalle
    INSERT INTO detalle_ventas (
        venta_id,
        producto_id,
        cantidad,
        precio_unitario,
        subtotal
    )
    VALUES (
        v_venta_id,
        p_producto_id,
        p_cantidad,
        v_precio,
        v_subtotal
    );

    -- Descontar stock
    UPDATE productos
    SET stock = stock - p_cantidad
    WHERE id = p_producto_id;

    -- Devolver resultado
    RETURN QUERY
    SELECT
        v_venta_id,
        v_total;

END;
$$;

-- Permitir que el frontend pueda ejecutar la función
GRANT EXECUTE ON FUNCTION public.registrar_venta(
    BIGINT,
    INTEGER,
    VARCHAR,
    VARCHAR
) TO anon, authenticated;