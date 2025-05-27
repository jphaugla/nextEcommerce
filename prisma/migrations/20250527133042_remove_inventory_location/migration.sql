/*
  Warnings:

  - You are about to drop the column `location` on the `Inventory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[itemId]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Inventory_itemId_idx";

-- DropIndex
DROP INDEX "Inventory_itemId_location_key";

-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "location";

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_itemId_key" ON "Inventory"("itemId");
