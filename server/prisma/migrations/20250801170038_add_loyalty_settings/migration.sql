-- CreateTable
CREATE TABLE "public"."loyalty_settings" (
    "id" TEXT NOT NULL,
    "pointsPerDollar" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "pointsPerRupiah" INTEGER NOT NULL DEFAULT 10000,
    "autoCalculate" BOOLEAN NOT NULL DEFAULT true,
    "minimumPurchase" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "defaultRewardPoints" INTEGER NOT NULL DEFAULT 10,
    "expirationDays" INTEGER NOT NULL DEFAULT 365,
    "allowNegativeBalance" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "merchantId" TEXT NOT NULL,

    CONSTRAINT "loyalty_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_settings_merchantId_key" ON "public"."loyalty_settings"("merchantId");

-- AddForeignKey
ALTER TABLE "public"."loyalty_settings" ADD CONSTRAINT "loyalty_settings_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "public"."merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
