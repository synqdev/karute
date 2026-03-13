-- DropForeignKey
ALTER TABLE "recording_sessions" DROP CONSTRAINT "recording_sessions_customer_id_fkey";

-- AlterTable
ALTER TABLE "recording_sessions" ALTER COLUMN "customer_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "recording_sessions" ADD CONSTRAINT "recording_sessions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
