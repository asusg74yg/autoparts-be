/*
  Warnings:

  - A unique constraint covering the columns `[trackingNumber]` on the table `ShippingLabel` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `ShippingLabel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "rating" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "ShippingLabel" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ShippingLabel_trackingNumber_key" ON "ShippingLabel"("trackingNumber");
