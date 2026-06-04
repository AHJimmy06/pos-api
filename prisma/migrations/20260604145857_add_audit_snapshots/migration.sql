-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "client_snapshot" JSONB,
ADD COLUMN     "seller_snapshot" JSONB;
