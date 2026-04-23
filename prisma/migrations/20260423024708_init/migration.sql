-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255),
    "apellido" VARCHAR(255),
    "telefono" VARCHAR(50),
    "direccion" VARCHAR(255),
    "correo" VARCHAR(255),

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255),
    "precio" DECIMAL(12,2),
    "stock" INTEGER,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impuestos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255),
    "tasa_actual" DECIMAL(5,2),

    CONSTRAINT "impuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER,
    "fecha_emision" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "subtotal_snapshot" DECIMAL(12,2),
    "ivatotal_snapshot" DECIMAL(12,2),
    "total_snapshot" DECIMAL(12,2),
    "transaccion_id" VARCHAR(255),

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factura_detalles" (
    "id" SERIAL NOT NULL,
    "factura_id" INTEGER,
    "producto_id" INTEGER,
    "cantidad" INTEGER,
    "precio_unitario_snapshot" DECIMAL(12,2),

    CONSTRAINT "factura_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factura_detalle_impuestos" (
    "id" SERIAL NOT NULL,
    "detalle_id" INTEGER,
    "impuesto_id" INTEGER,
    "tasa_snapshot" DECIMAL(5,2),
    "monto_calculado_snapshot" DECIMAL(12,2),

    CONSTRAINT "factura_detalle_impuestos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura_detalles" ADD CONSTRAINT "factura_detalles_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura_detalles" ADD CONSTRAINT "factura_detalles_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura_detalle_impuestos" ADD CONSTRAINT "factura_detalle_impuestos_detalle_id_fkey" FOREIGN KEY ("detalle_id") REFERENCES "factura_detalles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura_detalle_impuestos" ADD CONSTRAINT "factura_detalle_impuestos_impuesto_id_fkey" FOREIGN KEY ("impuesto_id") REFERENCES "impuestos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
