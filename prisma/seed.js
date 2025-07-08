// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const fetch = require("node-fetch");    // npm install node-fetch@2
const prisma = new PrismaClient();

const STARTING_STOCK = 50;
const PAGE_SIZE    = 20;    // fakestore’s fixed page size
const DESIRED      = 200;   // total items you want

async function fetchPage(page) {
  const res = await fetch(`https://fakestoreapi.com/products?limit=${PAGE_SIZE}&page=${page}`);
  if (!res.ok) throw new Error(`Failed to fetch page ${page}`);
  return res.json();
}

async function main() {
  // 1) Fetch the 20 real items
  const rawItems = await fetchPage(1);
  console.log(`🔄 Fetched ${rawItems.length} real items from fakestoreapi`);

  // 2) Compute how many times to repeat them
  const copies = Math.ceil(DESIRED / rawItems.length);

  // 3) Build exactly DESIRED clones, marking originals on copyIndex 0
  const allItems = Array.from({ length: copies })
    .flatMap((_, copyIndex) =>
      rawItems.map(it => ({
        ...it,
        cloneId    : `${it.id}-${copyIndex}`,     // unique ID
        isOriginal : copyIndex === 0,             // true only for original batch
      }))
    )
    .slice(0, DESIRED);

  console.log(`🔄 Generating ${allItems.length} total items by cloning`);

  // 4) Upsert each into Item + Inventory
  for (const it of allItems) {
    await prisma.item.upsert({
      where: { id: it.cloneId },
      update: {},
      create: {
        id           : it.cloneId,
        name         : it.title,
        src          : it.image,
        alt          : it.title,
        price        : it.price,
        stock        : STARTING_STOCK,
        description  : it.description,
        length       : 10,
        width        : 10,
        height       : 10,
        weight       : 1,
        discontinued : false,
        category     : it.category,
        isOriginal   : it.isOriginal,
      },
    });

    await prisma.inventory.upsert({
      where: { itemId: it.cloneId },
      update: {},
      create: {
        itemId : it.cloneId,
        onHand : STARTING_STOCK,
        reserved: 0,
      },
    });
  }

  console.log(`✅ Seeded ${allItems.length} cloned items + inventory`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

