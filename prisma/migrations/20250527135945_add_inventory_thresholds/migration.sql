-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "restockAmount" INT4 NOT NULL DEFAULT 50;
ALTER TABLE "Inventory" ADD COLUMN     "threshold" INT4 NOT NULL DEFAULT 10;
