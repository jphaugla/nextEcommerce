// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const rawItems = require("./fakestore-items.json");
const prisma  = new PrismaClient();

async function main() {
  for (const it of rawItems) {
    // Fake Store uses numeric IDs; we convert to string
    const id = String(it.id);

    // Map their fields to your schema
    const data = {
      id,
      name: it.title,
      src: it.image,
      alt: it.title,
      price: it.price,
      stock: 50,                    // you can hard-code stock
      description: it.description,
      length: 10,                   // dummy dimensions
      width:  10,
      height: 10,
      weight: 1,
      discontinued: false,
      category: it.category,
    };

    await prisma.item.upsert({
      where: { id },
      update: {},
      create: data,
    });
  }
  console.log(`✅ Seeded ${rawItems.length} items from Fake Store API`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

