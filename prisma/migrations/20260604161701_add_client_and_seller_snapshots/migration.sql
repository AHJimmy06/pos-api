/*
  Warnings:

  - A unique constraint covering the columns `[invoice_number]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "client_email_snapshot" VARCHAR(255),
ADD COLUMN     "client_name_snapshot" VARCHAR(255),
ADD COLUMN     "invoice_number" VARCHAR(20),
ADD COLUMN     "seller_name_snapshot" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_invoice_number_idx" ON "invoices"("invoice_number");
