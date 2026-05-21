/*
  Warnings:

  - You are about to drop the `clientes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `factura_detalle_impuestos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `factura_detalles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `facturas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `impuestos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "factura_detalle_impuestos" DROP CONSTRAINT "factura_detalle_impuestos_detalle_id_fkey";

-- DropForeignKey
ALTER TABLE "factura_detalle_impuestos" DROP CONSTRAINT "factura_detalle_impuestos_impuesto_id_fkey";

-- DropForeignKey
ALTER TABLE "factura_detalles" DROP CONSTRAINT "factura_detalles_factura_id_fkey";

-- DropForeignKey
ALTER TABLE "factura_detalles" DROP CONSTRAINT "factura_detalles_producto_id_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_cliente_id_fkey";

-- DropTable
DROP TABLE "clientes";

-- DropTable
DROP TABLE "factura_detalle_impuestos";

-- DropTable
DROP TABLE "factura_detalles";

-- DropTable
DROP TABLE "facturas";

-- DropTable
DROP TABLE "impuestos";

-- DropTable
DROP TABLE "productos";

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "phone" VARCHAR(50),
    "address" VARCHAR(255),
    "email" VARCHAR(255),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "price" DECIMAL(12,2),
    "stock" INTEGER,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "current_rate" DECIMAL(5,2),

    CONSTRAINT "taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER,
    "issue_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "subtotal_snapshot" DECIMAL(12,2),
    "tax_total_snapshot" DECIMAL(12,2),
    "total_snapshot" DECIMAL(12,2),
    "transaction_id" VARCHAR(255),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_details" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER,
    "product_id" INTEGER,
    "quantity" INTEGER,
    "unit_price_snapshot" DECIMAL(12,2),

    CONSTRAINT "invoice_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_detail_taxes" (
    "id" SERIAL NOT NULL,
    "detail_id" INTEGER,
    "tax_id" INTEGER,
    "rate_snapshot" DECIMAL(5,2),
    "calculated_amount_snapshot" DECIMAL(12,2),

    CONSTRAINT "invoice_detail_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "products_name_key" ON "products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "taxes_name_key" ON "taxes"("name");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_details" ADD CONSTRAINT "invoice_details_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_details" ADD CONSTRAINT "invoice_details_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_detail_taxes" ADD CONSTRAINT "invoice_detail_taxes_detail_id_fkey" FOREIGN KEY ("detail_id") REFERENCES "invoice_details"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_detail_taxes" ADD CONSTRAINT "invoice_detail_taxes_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "taxes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
