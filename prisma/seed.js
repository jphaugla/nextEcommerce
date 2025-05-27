// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const rawItems = require("./fakestore-items.json");
const prisma  = new PrismaClient();

const STARTING_STOCK   = 50;

async function main() {
  for (const it of rawItems) {
    const id = String(it.id);

    // 1) Upsert the Item
    await prisma.item.upsert({
      where:  { id },
      update: {},
      create: {
        id,
        name:        it.title,
        src:         it.image,
        alt:         it.title,
        price:       it.price,
        stock:       STARTING_STOCK,
        description: it.description,
        length:      10,
        width:       10,
        height:      10,
        weight:      1,
        discontinued:false,
        category:    it.category,
      },
    });

    // 2) Upsert the matching Inventory row
    await prisma.inventory.upsert({
      where:  { itemId: id },
      update: {},
      create: {
        itemId: id,             // ← fixed here
        onHand: STARTING_STOCK,
        reserved: 0,
      },
    });
  }

  console.log(`✅ Seeded ${rawItems.length} items + inventory`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
