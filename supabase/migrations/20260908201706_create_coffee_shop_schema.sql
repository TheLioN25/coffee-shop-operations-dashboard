-- ============================================================
-- COFFEE SHOP
-- Esquema inicial de PostgreSQL
-- ============================================================


-- ============================================================
-- 1. TABLA: COMPRADORES
-- ============================================================

CREATE TABLE compradores (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_completo VARCHAR(70) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 2. TABLA: PRODUCTOS
-- ============================================================

CREATE TABLE productos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(70) NOT NULL,
    precio NUMERIC(10,2) NOT NULL CHECK (precio > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    imagen_url TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 3. TABLA: VENTAS
-- ============================================================

CREATE TABLE ventas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    comprador_id BIGINT NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    iva NUMERIC(10,2) NOT NULL CHECK (iva >= 0),
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ventas_comprador
        FOREIGN KEY (comprador_id)
        REFERENCES compradores(id)
        ON DELETE RESTRICT
);


-- ============================================================
-- 4. TABLA: DETALLE_VENTAS
-- ============================================================

CREATE TABLE detalle_ventas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    venta_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario > 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),

    CONSTRAINT fk_detalle_venta
        FOREIGN KEY (venta_id)
        REFERENCES ventas(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (producto_id)
        REFERENCES productos(id)
        ON DELETE RESTRICT
);


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_ventas_comprador_id
    ON ventas(comprador_id);

CREATE INDEX idx_detalle_ventas_venta_id
    ON detalle_ventas(venta_id);

CREATE INDEX idx_detalle_ventas_producto_id
    ON detalle_ventas(producto_id);