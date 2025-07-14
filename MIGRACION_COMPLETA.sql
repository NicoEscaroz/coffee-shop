-- ===============================================
-- MIGRACIÓN COMPLETA COFFEE SHOP
-- Ejecutar en Supabase SQL Editor
-- ===============================================

-- PASO 1: MIGRACIÓN SOFT DELETE PARA PRODUCTOS
-- ===============================================

-- Agregar columna is_active a la tabla Productos (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Productos' AND column_name = 'is_active') THEN
        ALTER TABLE "Productos" ADD COLUMN "is_active" BOOLEAN DEFAULT true NOT NULL;
    END IF;
END $$;

-- Actualizar todos los productos existentes como activos
UPDATE "Productos" SET "is_active" = true WHERE "is_active" IS NULL;

-- Crear índice para mejorar performance (si no existe)
CREATE INDEX IF NOT EXISTS idx_productos_is_active ON "Productos" ("is_active");

-- PASO 2: MIGRACIÓN NUEVAS TABLAS DE VENTAS
-- ===============================================

-- Crear tabla Sales (nueva estructura)
CREATE TABLE IF NOT EXISTS "Sales" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "fecha_venta" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "total_venta" DECIMAL(10,2) NOT NULL CHECK ("total_venta" > 0),
    "metodo_pago" VARCHAR(50) DEFAULT 'efectivo' CHECK ("metodo_pago" IN ('efectivo', 'tarjeta', 'transferencia', 'otro')),
    "total_items" INTEGER NOT NULL DEFAULT 0 CHECK ("total_items" > 0),
    "descuento" DECIMAL(8,2) DEFAULT 0 CHECK ("descuento" >= 0),
    "subtotal" DECIMAL(10,2) NOT NULL CHECK ("subtotal" > 0),
    "vendedor" VARCHAR(100),
    "notas" TEXT,
    "estado" VARCHAR(20) DEFAULT 'completada' CHECK ("estado" IN ('completada', 'cancelada', 'pendiente')),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crear tabla SalesDetails (nueva estructura)
CREATE TABLE IF NOT EXISTS "SalesDetails" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "venta_id" UUID NOT NULL REFERENCES "Sales"("id") ON DELETE CASCADE,
    "producto_id" INTEGER NOT NULL,
    "producto_nombre" VARCHAR(255) NOT NULL,
    "producto_categoria" VARCHAR(100),
    "producto_descripcion" TEXT,
    "precio_unitario" DECIMAL(8,2) NOT NULL CHECK ("precio_unitario" > 0),
    "cantidad" INTEGER NOT NULL CHECK ("cantidad" > 0),
    "subtotal" DECIMAL(10,2) NOT NULL CHECK ("subtotal" > 0),
    "descuento_item" DECIMAL(8,2) DEFAULT 0 CHECK ("descuento_item" >= 0),
    "total_item" DECIMAL(10,2) NOT NULL CHECK ("total_item" > 0),
    "costo_producto" DECIMAL(8,2),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PASO 3: CREAR ÍNDICES PARA PERFORMANCE
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_sales_fecha_venta ON "Sales" ("fecha_venta");
CREATE INDEX IF NOT EXISTS idx_sales_estado ON "Sales" ("estado");
CREATE INDEX IF NOT EXISTS idx_sales_vendedor ON "Sales" ("vendedor");
CREATE INDEX IF NOT EXISTS idx_sales_metodo_pago ON "Sales" ("metodo_pago");
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON "Sales" ("created_at");

CREATE INDEX IF NOT EXISTS idx_sales_details_venta_id ON "SalesDetails" ("venta_id");
CREATE INDEX IF NOT EXISTS idx_sales_details_producto_id ON "SalesDetails" ("producto_id");
CREATE INDEX IF NOT EXISTS idx_sales_details_producto_nombre ON "SalesDetails" ("producto_nombre");
CREATE INDEX IF NOT EXISTS idx_sales_details_created_at ON "SalesDetails" ("created_at");

-- PASO 4: CREAR FUNCIONES Y TRIGGERS
-- ===============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en Sales
DROP TRIGGER IF EXISTS update_sales_updated_at ON "Sales";
CREATE TRIGGER update_sales_updated_at 
    BEFORE UPDATE ON "Sales" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Función para validar totales automáticamente
CREATE OR REPLACE FUNCTION validate_sales_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que subtotal = precio_unitario * cantidad
    IF NEW.subtotal != (NEW.precio_unitario * NEW.cantidad) THEN
        RAISE EXCEPTION 'Subtotal incorrecto: debería ser % pero es %', 
            (NEW.precio_unitario * NEW.cantidad), NEW.subtotal;
    END IF;
    
    -- Validar que total_item = subtotal - descuento_item
    IF NEW.total_item != (NEW.subtotal - NEW.descuento_item) THEN
        RAISE EXCEPTION 'Total item incorrecto: debería ser % pero es %', 
            (NEW.subtotal - NEW.descuento_item), NEW.total_item;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para validar totales en SalesDetails
DROP TRIGGER IF EXISTS validate_sales_details_totals ON "SalesDetails";
CREATE TRIGGER validate_sales_details_totals 
    BEFORE INSERT OR UPDATE ON "SalesDetails" 
    FOR EACH ROW 
    EXECUTE FUNCTION validate_sales_totals();

-- PASO 5: CREAR VISTAS PARA CONSULTAS RÁPIDAS
-- ===============================================

-- Vista para ventas completas
CREATE OR REPLACE VIEW "VentasCompletas" AS
SELECT 
    s.id as venta_id,
    s.fecha_venta,
    s.total_venta,
    s.metodo_pago,
    s.vendedor,
    s.estado,
    sd.producto_id,
    sd.producto_nombre,
    sd.cantidad,
    sd.precio_unitario,
    sd.subtotal,
    sd.total_item,
    CASE 
        WHEN sd.costo_producto IS NOT NULL 
        THEN sd.total_item - (sd.costo_producto * sd.cantidad)
        ELSE NULL 
    END as ganancia_item
FROM "Sales" s
INNER JOIN "SalesDetails" sd ON s.id = sd.venta_id
WHERE s.estado = 'completada';

-- Vista para productos más vendidos
CREATE OR REPLACE VIEW "ProductosMasVendidos" AS
SELECT 
    sd.producto_id,
    sd.producto_nombre,
    COUNT(*) as veces_vendido,
    SUM(sd.cantidad) as cantidad_total_vendida,
    SUM(sd.total_item) as ingresos_totales,
    AVG(sd.precio_unitario) as precio_promedio,
    MAX(s.fecha_venta) as ultima_venta
FROM "Sales" s
INNER JOIN "SalesDetails" sd ON s.id = sd.venta_id
WHERE s.estado = 'completada'
GROUP BY sd.producto_id, sd.producto_nombre
ORDER BY cantidad_total_vendida DESC;

-- PASO 6: FUNCIÓN RPC PARA CONSULTAS AVANZADAS
-- ===============================================

CREATE OR REPLACE FUNCTION get_sales_by_date_range(
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    venta_id UUID,
    fecha_venta TIMESTAMPTZ,
    total_venta DECIMAL,
    metodo_pago VARCHAR,
    vendedor VARCHAR,
    total_items INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.fecha_venta,
        s.total_venta,
        s.metodo_pago,
        s.vendedor,
        s.total_items
    FROM "Sales" s
    WHERE DATE(s.fecha_venta) BETWEEN start_date AND end_date
    AND s.estado = 'completada'
    ORDER BY s.fecha_venta DESC;
END;
$$;

-- PASO 7: INSERTAR DATOS DE PRUEBA (OPCIONAL)
-- ===============================================

-- Insertar una venta de prueba para verificar que todo funciona
DO $$
DECLARE
    venta_id UUID;
    producto_existe BOOLEAN;
BEGIN
    -- Verificar si existe al menos un producto activo
    SELECT EXISTS(SELECT 1 FROM "Productos" WHERE "is_active" = true LIMIT 1) INTO producto_existe;
    
    IF producto_existe THEN
        -- Crear venta de prueba
        INSERT INTO "Sales" (
            fecha_venta, 
            total_venta, 
            metodo_pago, 
            total_items, 
            descuento, 
            subtotal, 
            vendedor, 
            notas, 
            estado
        ) VALUES (
            now(), 
            15.50, 
            'efectivo', 
            2, 
            0, 
            15.50, 
            'Sistema', 
            'Venta de prueba - Migración', 
            'completada'
        ) RETURNING id INTO venta_id;
        
        -- Crear detalle de venta de prueba
        INSERT INTO "SalesDetails" (
            venta_id,
            producto_id,
            producto_nombre,
            precio_unitario,
            cantidad,
            subtotal,
            descuento_item,
            total_item
        ) 
        SELECT 
            venta_id,
            p.id,
            p.product,
            p.price,
            1,
            p.price,
            0,
            p.price
        FROM "Productos" p 
        WHERE p.is_active = true 
        LIMIT 1;
        
        RAISE NOTICE 'Venta de prueba creada con ID: %', venta_id;
    ELSE
        RAISE NOTICE 'No hay productos activos para crear venta de prueba';
    END IF;
END $$;

-- PASO 8: COMENTARIOS Y DOCUMENTACIÓN
-- ===============================================

COMMENT ON TABLE "Sales" IS 'Tabla principal de ventas del coffee shop - Nueva estructura optimizada';
COMMENT ON TABLE "SalesDetails" IS 'Detalles de productos vendidos en cada venta - Preserva información histórica';
COMMENT ON COLUMN "Sales"."id" IS 'UUID único para cada venta';
COMMENT ON COLUMN "Sales"."fecha_venta" IS 'Fecha y hora exacta de la venta con zona horaria';
COMMENT ON COLUMN "SalesDetails"."producto_id" IS 'Referencia al producto (permite soft delete)';
COMMENT ON COLUMN "SalesDetails"."producto_nombre" IS 'Nombre del producto al momento de la venta (histórico)';

-- ===============================================
-- MIGRACIÓN COMPLETADA EXITOSAMENTE
-- ===============================================

SELECT 
    'MIGRACIÓN COMPLETADA' as estado,
    (SELECT COUNT(*) FROM "Sales") as ventas_nuevas,
    (SELECT COUNT(*) FROM "SalesDetails") as detalles_nuevos,
    (SELECT COUNT(*) FROM "Productos" WHERE is_active = true) as productos_activos; 