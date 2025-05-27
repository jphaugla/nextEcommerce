-- CreateTable
CREATE TABLE "Inventory" (
    "id" STRING NOT NULL,
    "itemId" STRING NOT NULL,
    "onHand" INT4 NOT NULL DEFAULT 0,
    "reserved" INT4 NOT NULL DEFAULT 0,
    "location" STRING,
    "lastAdjustedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" STRING NOT NULL,
    "inventoryId" STRING NOT NULL,
    "change" INT4 NOT NULL,
    "type" STRING NOT NULL,
    "reference" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inventory_itemId_idx" ON "Inventory"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_itemId_location_key" ON "Inventory"("itemId", "location");

-- CreateIndex
CREATE INDEX "InventoryTransaction_inventoryId_createdAt_idx" ON "InventoryTransaction"("inventoryId", "createdAt");
