// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const fetch = require("node-fetch"); // npm install node-fetch@2
const prisma = new PrismaClient();

const STARTING_STOCK = 50;
const DESIRED        = 200;  // total items you want
const PLACEHOLDER = "/images/placeholder.png";

// Quick HEAD check: return original URL if healthy, else placeholder
async function validateImageUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD", timeout: 2000 });
    if (res.ok) return url;
  } catch (err) {
    // ignore errors/timeouts
  }
  return PLACEHOLDER;
}

// 1) Fetch the full array from the static GitHub JSON
async function fetchAll() {
  const url =
    "https://raw.githubusercontent.com/ProgrammingHero1/ema-john-resources/main/fakeData/products.json";
  console.log(`→ fetching full dataset from ${url}`);
  const res = await fetch(url, {
    headers: { "Accept": "application/json" }
  });
  console.log(`← response: ${res.status} ${res.statusText}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch products.json: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Unexpected JSON shape: expected an array, got ${typeof data}`);
  }
  return data;
}

async function main() {
  // 2) Load all real items
  const realItems = await fetchAll();
  console.log(`🔄 Fetched ${realItems.length} real items`);

  if (realItems.length === 0) {
    console.error("❌ No products fetched—aborting seed.");
    process.exit(1);
  }

  // 3) Build up to DESIRED clones (or trim if array ≥ DESIRED)
  let allItems;
  if (realItems.length >= DESIRED) {
    console.log(`🔍 We have ≥${DESIRED} items; taking first ${DESIRED}`);
    allItems = realItems.slice(0, DESIRED).map(item => ({
      ...item,
      cloneId    : `${item.id}-0`,
      isOriginal : true
    }));
  } else {
    console.log(
      `🔄 Only ${realItems.length} items available; cloning to reach ${DESIRED}`
    );
    const copies = Math.ceil(DESIRED / realItems.length);
    allItems = Array.from({ length: copies })
      .flatMap((_, copyIndex) =>
        realItems.map(item => ({
          ...item,
          cloneId    : `${item.id}-${copyIndex}`,
          isOriginal : copyIndex === 0
        }))
      )
      .slice(0, DESIRED);
  }

  console.log(`🔄 Preparing ${allItems.length} items for seeding`);

  // 4) Upsert each into item + inventory, validating img URLs first
  for (const it of allItems) {
    const validSrc = await validateImageUrl(it.img);

    await prisma.item.upsert({
      where: { id: it.cloneId },
      update: {},
      create: {
        id          : it.cloneId,
        name        : it.name,
        src         : validSrc,         // guaranteed to resolve
        alt         : it.name,
        price       : it.price,
        stock       : STARTING_STOCK,
        description : it.description || "",
        length      : 10,
        width       : 10,
        height      : 10,
        weight      : 1,
        discontinued: false,
        category    : it.category,
        isOriginal  : it.isOriginal,
      },
    });

    await prisma.inventory.upsert({
      where: { itemId: it.cloneId },
      update: {},
      create: {
        itemId   : it.cloneId,
        onHand   : STARTING_STOCK,
        reserved : 0,
      },
    });
  }

  console.log(`✅ Seeded ${allItems.length} items + inventory`);
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

