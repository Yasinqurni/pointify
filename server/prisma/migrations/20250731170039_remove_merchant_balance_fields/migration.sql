/*
  Warnings:

  - You are about to drop the column `idrxBalance` on the `merchants` table. All the data in the column will be lost.
  - You are about to drop the column `loyalBalance` on the `merchants` table. All the data in the column will be lost.
  - You are about to drop the column `totalRewarded` on the `merchants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."merchants" DROP COLUMN "idrxBalance",
DROP COLUMN "loyalBalance",
DROP COLUMN "totalRewarded";
