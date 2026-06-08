-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "parent_invoice_id" INTEGER;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_parent_invoice_id_fkey" FOREIGN KEY ("parent_invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
