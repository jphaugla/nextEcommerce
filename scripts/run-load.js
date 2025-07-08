#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { randomInt } = require('crypto');
const { v4: uuid } = require('uuid');

// A helper that wraps tx functions with retry and per-tx logging
async function runWithRetry(fn, tag, retries = 3) {
  const txId = uuid().slice(0, 6);
  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`▶ Starting tx [${tag}] id=${txId} attempt=${attempt}`);
    try {
      const result = await fn(client);
      console.log(`✔︎ tx [${tag}] id=${txId} succeeded on attempt ${attempt}`);
      return result;
    } catch (err) {
      console.warn(`⚠️ [${tag}] id=${txId} attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

const client = new PrismaClient();

async function spawnRun(runId, initiator, numSessions, numOrders, restockInterval) {
  console.log(`› Preloading products…`);
  const allItems = await client.item.findMany({
    select: { id: true, stock: true, price: true, description: true, src: true },
  });

  async function restockIfNeeded() {
    const invs = await client.inventory.findMany({
      select: { id: true, itemId: true, onHand: true, threshold: true, restockAmount: true },
    });
    const low = invs.filter((i) => i.onHand < i.threshold);
    if (!low.length) return;
    console.log(`› Restocking ${low.length} item(s)…`);
    await runWithRetry(
      (tx) =>
        Promise.all(
          low.map((inv) =>
            tx.inventory.update({
              where: { id: inv.id },
              data: {
                onHand: { increment: inv.restockAmount },
                transactions: {
                  create: {
                    change: inv.restockAmount,
                    type: 'RESTOCK',
                    reference: runId,
                  },
                },
              },
            })
          )
        ),
      'restock'
    );
  }

  // Create LoadRun record
  await runWithRetry(
    (tx) =>
      tx.loadRun.create({
        data: { id: runId, userEmail: initiator, numSessions, numOrders },
      }),
    'load-run-init'
  );

  const perSessionRestock = Math.max(1, Math.floor(restockInterval / numSessions));

  // Parallel sessions
  await Promise.all(
    Array.from({ length: numSessions }).map(async (_, idx) => {
      const username =
        idx === 0
          ? initiator
          : `${String(randomInt(0, 2000)).padStart(4, '0')}@cockroachlabs.com`;

      console.log(`\n--- Session ${idx + 1}/${numSessions}: ${username} ---`);

      // Upsert user
      const user = await runWithRetry(
        (tx) =>
          tx.user.upsert({
            where: { email: username },
            update: {},
            create: { email: username },
          }),
        'upsert-user'
      );

      // Upsert cart
      const cart = await runWithRetry(
        (tx) =>
          tx.cart.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id },
          }),
        'upsert-cart'
      );

      let sessionOrders = 0;
      const sessionStart = new Date();

      for (let i = 0; i < numOrders; i++) {
        // Pick random items
        const picked = allItems
          .map((it) => ({ ...it, rnd: Math.random() }))
          .sort((a, b) => a.rnd - b.rnd)
          .slice(0, randomInt(1, 9));

        // A) Reserve
        await runWithRetry(
          async (tx) => {
            await Promise.all(
              picked.map(({ id: itemId, stock }) => {
                const qty = stock > 1 ? randomInt(1, 4) : 1;
                return tx.cartItem
                  .upsert({
                    where: { cartId_itemId: { cartId: cart.id, itemId } },
                    update: { quantity: { increment: qty } },
                    create: { cartId: cart.id, itemId, quantity: qty },
                  })
                  .then(() =>
                    tx.inventory.update({
                      where: { itemId },
                      data: { reserved: { increment: qty } },
                    })
                  );
              })
            );
          },
          'reserve-cart'
        );

        // B) Create order
        const newOrder = await runWithRetry(
          (tx) =>
            tx.order.create({
              data: {
                userId: user.id,
                totalCents: picked.reduce((sum, { price }) => sum + Math.round(price * 100), 0),
                items: {
                  create: picked.map(({ id, description, src, price }) => ({
                    itemId: id,
                    quantity: 1,
                    priceCents: Math.round(price * 100),
                    description,
                    src,
                  })),
                },
              },
            }),
          'create-order'
        );

        // C&D) Adjust inventory & clear cart
        await runWithRetry(
          async (tx) => {
            await Promise.all(
              picked.map(async ({ id: itemId }) => {
                const inv = await tx.inventory.findUnique({
                  where: { itemId },
                  select: { id: true, onHand: true, reserved: true },
                });
                if (!inv) return;

                if (inv.onHand > 0) {
                  // SALE
                  await tx.inventory.update({
                    where: { id: inv.id },
                    data: {
                      onHand: { decrement: 1 },
                      reserved: { decrement: 1 },
                      transactions: {
                        create: {
                          change: -1,
                          type: 'SALE',
                          reference: newOrder.id,
                        },
                      },
                    },
                  });
                } else {
                  // RELEASE / OUT_OF_STOCK
                  const releaseQty = Math.min(inv.reserved, 1);
                  await tx.inventory.update({
                    where: { id: inv.id },
                    data: {
                      reserved: { decrement: releaseQty },
                      transactions: {
                        create: [
                          { change: -releaseQty, type: 'RELEASE', reference: newOrder.id },
                          { change: 0, type: 'OUT_OF_STOCK', reference: newOrder.id },
                        ],
                      },
                    },
                  });
                }
              })
            );
            // Clear cart
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
          },
          'adjust-and-clear'
        );

        sessionOrders++;

        // Periodic restock
        if (idx === 0 && sessionOrders % perSessionRestock === 0) {
          await restockIfNeeded();
        }
      }

      // Write summary
      await runWithRetry(
        (tx) =>
          tx.loadRunSummary.create({
            data: {
              runId,
              username,
              ordersCompleted: sessionOrders,
              startTime: sessionStart,
              endTime: new Date(),
            },
          }),
        'write-summary'
      );
    })
  );

  // === CLEANUP PASS: release any stray reservations ===
  console.log('› Cleaning up stray reservations…');
  // Remove any leftover cart items
  await client.cartItem.deleteMany({});
  // Atomically push reserved back into onHand and zero reserved
  await client.$executeRawUnsafe(`
    UPDATE "Inventory"
    SET "onHand" = "onHand" + "reserved",
        "reserved" = 0
    WHERE "reserved" > 0
  `);

  // === ORDER-STATUS PROMOTION PASS ===
  console.log('› Promoting some order statuses…');

  // 1) Promote oldest 40% of PENDING → PROCESSING
  const totalPending = await client.order.count({ where: { status: 'PENDING' } });
  const toProcess    = Math.floor(totalPending * 0.4);
  if (toProcess > 0) {
    const pendingOrders = await client.order.findMany({
      where:   { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },    // oldest first
      take:     toProcess,
      select:  { id: true }
    });
    await Promise.all(
      pendingOrders.map(({ id }) =>
        client.order.update({ where: { id }, data: { status: 'PROCESSING' } })
      )
    );
    console.log(`  • ${toProcess} PENDING → PROCESSING`);
  }

  // 2) Promote oldest 30% of PROCESSING → FULFILLED
  const totalProc = await client.order.count({ where: { status: 'PROCESSING' } });
  const toFulfill = Math.floor(totalProc * 0.3);
  if (toFulfill > 0) {
    const procOrders = await client.order.findMany({
      where:   { status: 'PROCESSING' },
      orderBy: { createdAt: 'asc' },
      take:     toFulfill,
      select:  { id: true }
    });
    await Promise.all(
      procOrders.map(({ id }) =>
        client.order.update({ where: { id }, data: { status: 'FULFILLED' } })
      )
    );
    console.log(`  • ${toFulfill} PROCESSING → FULFILLED`);
  }

  // Finalize run
  console.log(`› Finalizing LoadRun…`);
  await runWithRetry(
    (tx) => tx.loadRun.update({ where: { id: runId }, data: { endTime: new Date() } }),
    'finalize-run'
  );
}

async function main() {
  const [,, sessions, orders, interval, user = 'admin@cockroachlabs.com'] = process.argv;
  const numSessions     = parseInt(sessions, 10);
  const numOrders       = parseInt(orders,   10);
  const restockInterval = parseInt(interval, 10);
  const runId           = uuid();

  console.log(`\n🚀 Starting run ${runId} — ${numSessions} session(s), ${numOrders} orders each, interval ${restockInterval}\n`);
  try {
    await spawnRun(runId, user, numSessions, numOrders, restockInterval);
  } catch (err) {
    console.error('❌ Load run failed:', err);
    process.exit(1);
  } finally {
    await client.$disconnect();
  }

  console.log('\n✅ All done.');
}

main();
