// scripts/restock-run.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const LOW_STOCK_LIMIT = 10;
const RESTOCK_AMOUNT  = 50;

async function restock() {
  console.log("🔍 Checking low-stock items…");
  const low = await prisma.inventory.findMany({
    where: { onHand: { lt: LOW_STOCK_LIMIT } },
    select: { id: true },
  });

  if (low.length === 0) {
    console.log("✅ All items above threshold");
    return;
  }

  await Promise.all(
    low.map(inv =>
      prisma.inventory.update({
        where: { id: inv.id },
        data: {
          onHand: { increment: RESTOCK_AMOUNT },
          transactions: {
            create: {
              change:    RESTOCK_AMOUNT,
              type:      "RESTOCK",
              reference: "auto-restock",
            },
          },
        },
      })
    )
  );

  console.log(`🔄 Restocked ${low.length} item(s)`);
}

restock()
  .catch(e => {
    console.error("Restock failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

