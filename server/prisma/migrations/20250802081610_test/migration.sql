/*
  Warnings:

  - You are about to drop the column `transactionHash` on the `redemptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."redemptions" DROP COLUMN "transactionHash";
