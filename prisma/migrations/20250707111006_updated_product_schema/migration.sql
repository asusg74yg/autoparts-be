/*
  Warnings:

  - You are about to drop the column `brandId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `engineId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `modelId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `subCategoryId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Brand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Engine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehicleModel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Year` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Engine" DROP CONSTRAINT "Engine_modelId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_brandId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_engineId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_modelId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_subCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "SubCategory" DROP CONSTRAINT "SubCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleModel" DROP CONSTRAINT "VehicleModel_brandId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleModel" DROP CONSTRAINT "VehicleModel_yearId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "brandId",
DROP COLUMN "engineId",
DROP COLUMN "modelId",
DROP COLUMN "subCategoryId",
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "engine" TEXT,
ADD COLUMN     "subCategory" TEXT,
ADD COLUMN     "vehicleModel" TEXT,
ADD COLUMN     "year" TEXT;

-- DropTable
DROP TABLE "Brand";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Engine";

-- DropTable
DROP TABLE "SubCategory";

-- DropTable
DROP TABLE "VehicleModel";

-- DropTable
DROP TABLE "Year";
