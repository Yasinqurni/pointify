-- CreateEnum
CREATE TYPE "public"."MerchantStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."merchants" ADD COLUMN     "status" "public"."MerchantStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "transactionHash" TEXT;
