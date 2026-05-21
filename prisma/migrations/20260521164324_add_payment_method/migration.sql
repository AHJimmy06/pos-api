-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH');

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL DEFAULT 'CASH';
