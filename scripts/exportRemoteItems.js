// scripts/exportRemoteItems.js
const fetch = require("node-fetch");
const fs    = require("fs");
const path  = require("path");

const REST_URL = "https://squarenext.vercel.app/api/items";
const OUT_FILE = path.resolve(__dirname, "../prisma/remote-items.json");

async function main() {
  const res = await fetch(REST_URL, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    console.error("Network error:", res.status, await res.text());
    process.exit(1);
  }

  const items = await res.json();
  if (!Array.isArray(items)) {
    console.error("Unexpected response:", items);
    process.exit(1);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(items, null, 2));
  console.log(`✔️ Wrote ${items.length} items to ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
