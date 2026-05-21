/*
  Warnings:

  - You are about to drop the column `tax_id` on the `products` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_tax_id_fkey";

-- AlterTable
ALTER TABLE "invoice_details" ADD COLUMN     "product_name" VARCHAR(255);

-- AlterTable
ALTER TABLE "products" DROP COLUMN "tax_id";

-- CreateTable
CREATE TABLE "product_taxes" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "tax_id" INTEGER NOT NULL,

    CONSTRAINT "product_taxes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product_taxes" ADD CONSTRAINT "product_taxes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_taxes" ADD CONSTRAINT "product_taxes_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "taxes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
