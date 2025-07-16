-- CreateTable
CREATE TABLE "cart_reservation" (
    "id" STRING NOT NULL,
    "cartId" STRING NOT NULL,
    "itemId" STRING NOT NULL,
    "quantity" INT4 NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_reservation_pkey" PRIMARY KEY ("id")
);
