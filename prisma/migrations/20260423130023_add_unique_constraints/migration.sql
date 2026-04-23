/*
  Warnings:

  - A unique constraint covering the columns `[correo]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `impuestos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `productos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "clientes_correo_key" ON "clientes"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "impuestos_nombre_key" ON "impuestos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "productos_nombre_key" ON "productos"("nombre");
