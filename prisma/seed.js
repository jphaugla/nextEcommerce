// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const fetch = require("node-fetch");    // npm install node-fetch@2
const prisma = new PrismaClient();

const STARTING_STOCK = 50;
// how many pages to fetch (20 items/page by default)
const PAGES = 5;

async function fetchPage(page) {
  const res = await fetch(`https://fakestoreapi.com/products?limit=20&page=${page}`);
  if (!res.ok) throw new Error(`Failed to fetch page ${page}`);
  return res.json();
}

async function main() {
  // 1) Fetch all pages in parallel
  const pages = await Promise.all(
    Array.from({ length: PAGES }, (_, i) => fetchPage(i + 1))
  );
  // 2) Flatten into one big array
  const rawItems = pages.flat();

  console.log(`🔄 Fetched ${rawItems.length} items from fakestoreapi`);

  for (const it of rawItems) {
    const id = String(it.id + (it.pageOffset || 0)); 
    // If the API reuses ids each page, you can offset them:
    // const id = `${page}-${it.id}`;

    // Upsert the Item
    await prisma.item.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: it.title,
        src: it.image,
        alt: it.title,
        price: it.price,
        stock: STARTING_STOCK,
        description: it.description,
        length: 10,
        width: 10,
        height: 10,
        weight: 1,
        discontinued: false,
        category: it.category,
      },
    });

    // Upsert the Inventory
    await prisma.inventory.upsert({
      where: { itemId: id },
      update: {},
      create: {
        itemId: id,
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

