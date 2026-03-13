-- DropForeignKey
ALTER TABLE "karute_records" DROP CONSTRAINT "karute_records_customer_id_fkey";

-- AlterTable
ALTER TABLE "karute_records" ALTER COLUMN "customer_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "karute_records" ADD CONSTRAINT "karute_records_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
