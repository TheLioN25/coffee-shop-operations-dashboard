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
    v_precio_final NUMERIC(10,2);
    v_stock INTEGER;
    v_subtotal NUMERIC(10,2);
    v_iva NUMERIC(10,2);
    v_total NUMERIC(10,2);
    v_venta_id BIGINT;
BEGIN
    IF p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad debe ser mayor que cero.';
    END IF;

    IF p_nombre_completo IS NULL
       OR TRIM(p_nombre_completo) = '' THEN
        RAISE EXCEPTION 'El nombre completo es obligatorio.';
    END IF;

    IF p_email IS NULL
       OR TRIM(p_email) = '' THEN
        RAISE EXCEPTION 'El correo electrónico es obligatorio.';
    END IF;

    SELECT
        precio,
        stock
    INTO
        v_precio_final,
        v_stock
    FROM public.productos
    WHERE id = p_producto_id
      AND activo = TRUE
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El producto no existe o está inactivo.';
    END IF;

    IF v_stock < p_cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente. Disponible: %.', v_stock;
    END IF;

    /*
     * productos.precio es el precio final al consumidor,
     * incluido el IVA del 19 %.
     *
     * Ejemplo:
     * Precio final: $6.500
     * Base:         $6.500 / 1.19 = $5.462,18
     * IVA:          $6.500 - $5.462,18 = $1.037,82
     */
    v_total := ROUND(v_precio_final * p_cantidad, 2);
    v_subtotal := ROUND(v_total / 1.19, 2);
    v_iva := ROUND(v_total - v_subtotal, 2);

    INSERT INTO public.compradores (
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

    INSERT INTO public.ventas (
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

    INSERT INTO public.detalle_ventas (
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
        v_precio_final,
        v_total
    );

    UPDATE public.productos
    SET
        stock = stock - p_cantidad,
        fecha_actualizacion = NOW()
    WHERE id = p_producto_id;

    RETURN QUERY
    SELECT
        v_venta_id,
        v_total;
END;
$$;