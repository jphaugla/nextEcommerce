#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { randomInt }     = require('crypto');
const { v4: uuid }      = require('uuid');

const client = new PrismaClient();

/**
 * Retry wrapper: fn must be a zero-arg async function.
 * Retries on deadlock/conflict/serialization/please retry/connection-closed.
 * Increments LoadRun.failed via incrementFailed() on final failure.
 */
async function runWithRetry(
  fn,
  tag,
  retries = 5,
  sessionId = null,
  incrementFailed = null
) {
  const txId = uuid().slice(0, 6);
  const retryRegex = /deadlock|conflict|serialization failure|please retry your transaction|server has closed the connection/i;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const prefix = sessionId ? `[S${sessionId}] ` : '';
    console.log(`${prefix}▶ Starting tx [${tag}] id=${txId} attempt=${attempt}`);
    try {
      const result = await fn();
      console.log(`${prefix}✔︎ tx [${tag}] id=${txId} succeeded on attempt ${attempt}`);
      return result;
    } catch (err) {
      const msg = err.message || '';
      const isTransient = retryRegex.test(msg) || err.code === 'P1017';
      // if non-transient or final attempt, record failure and rethrow
      if (!isTransient || attempt === retries) {
        console.error(
          `${prefix}❌ tx [${tag}] id=${txId} failed${isTransient ? ` after ${retries} attempts` : ''}: ${msg}`
        );
        if (incrementFailed) await incrementFailed();
        throw err;
      }
      console.warn(
        `${prefix}⚠️ tx [${tag}] id=${txId} conflict on attempt ${attempt}: ${msg}`
      );
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
}

async function spawnRun(runId, initiator, numSessions, numOrders, restockInterval) {
  // helper to bump LoadRun.failed
  const incrementFailed = () =>
    client.loadRun.update({
      where: { id: runId },
      data:  { failed: { increment: 1 } },
    });

  console.log(`› Preloading products…`);
  const allItems = await client.item.findMany({
    select: { id: true, stock: true, price: true, description: true, src: true },
  });

  async function restockIfNeeded() {
    const invs = await client.inventory.findMany({
      select: { id: true, onHand: true, threshold: true, restockAmount: true },
    });
    const low = invs.filter(i => i.onHand < i.threshold);
    if (!low.length) return;
    console.log(`› Restocking ${low.length} item(s)…`);
    await runWithRetry(
      () => Promise.all(
        low.map(inv =>
          client.inventory.update({
            where: { id: inv.id },
            data: {
              onHand: { increment: inv.restockAmount },
              transactions: {
                create: { change: inv.restockAmount, type: 'RESTOCK', reference: runId }
              }
            }
          })
        )
      ),
      'restock',
      5,
      null,
      incrementFailed
    );
  }

  // Create LoadRun record
  await runWithRetry(
    () => client.loadRun.create({
      data: { id: runId, userEmail: initiator, numSessions, numOrders, failed: 0 },
    }),
    'load-run-init',
    5,
    null,
    incrementFailed
  );

  const perSessionRestock = Math.max(1, Math.floor(restockInterval / numSessions));

  // Run sessions in parallel, staggered
  await Promise.all(
    Array.from({ length: numSessions }).map(async (_, idx) => {
      const sessionId = idx + 1;
      await new Promise(r => setTimeout(r, randomInt(0, 500)));
      const username = idx === 0
        ? initiator
        : `${String(randomInt(0,2000)).padStart(4,'0')}@cockroachlabs.com`;

      const sessionRetry = (fn, tag) =>
        runWithRetry(fn, tag, 5, sessionId, incrementFailed);

      console.log(`[S${sessionId}] --- Session ${sessionId}/${numSessions}: ${username} ---`);

      // Upsert user
      const user = await sessionRetry(
        () => client.user.upsert({
          where: { email: username },
          update: {},
          create: { email: username }
        }),
        'upsert-user'
      );

      // Upsert cart
      const cart = await sessionRetry(
        () => client.cart.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id }
        }),
        'upsert-cart'
      );

      let sessionOrders = 0;
      const sessionStart = new Date();

      for (let i = 0; i < numOrders; i++) {
        // A) Reserve
        const picked = allItems
          .map(it => ({ ...it, rnd: Math.random() }))
          .sort((a,b) => a.rnd - b.rnd)
          .slice(0, randomInt(1,9));

        await sessionRetry(
          async () => {
            await Promise.all(
              picked.map(({ id: itemId, stock }) => {
                const qty = stock > 1 ? randomInt(1,4) : 1;
                return client.cartItem
                  .upsert({
                    where: { cartId_itemId: { cartId: cart.id, itemId } },
                    update: { quantity: { increment: qty } },
                    create: { cartId: cart.id, itemId, quantity: qty },
                  })
                  .then(() =>
                    client.inventory.update({
                      where: { itemId },
                      data: { reserved: { increment: qty } }
                    })
                  );
              })
            );
          },
          'reserve-cart'
        );

        // B) Create order
        const newOrder = await sessionRetry(
          () => client.order.create({
            data: {
              userId: user.id,
              totalCents: picked.reduce((s, { price }) => s + Math.round(price*100), 0),
              items: {
                create: picked.map(({ id, description, src, price }) => ({
                  itemId: id,
                  quantity: 1,
                  priceCents: Math.round(price*100),
                  description,
                  src,
                })),
              },
            },
          }),
          'create-order'
        );

        // C&D) Adjust-and-clear with failure catch
        try {
          await sessionRetry(
            () => client.$transaction(async tx => {
              for (const { id: itemId } of picked) {
                const inv = await tx.inventory.findUnique({
                  where: { itemId },
                  select: { id: true, onHand: true, reserved: true },
                });
                if (!inv) continue;
                if (inv.onHand > 0) {
                  await tx.inventory.update({
                    where: { id: inv.id },
                    data: {
                      onHand: { decrement: 1 },
                      reserved: { decrement: 1 },
                      transactions: {
                        create: { change: -1, type: 'SALE', reference: newOrder.id }
                      }
                    }
                  });
                } else {
                  const releaseQty = Math.min(inv.reserved,1);
                  await tx.inventory.update({
                    where: { id: inv.id },
                    data: {
                      reserved: { decrement: releaseQty },
                      transactions: {
                        create: [
                          { change: -releaseQty, type: 'RELEASE',     reference: newOrder.id },
                          { change: 0,            type: 'OUT_OF_STOCK', reference: newOrder.id },
                        ]
                      }
                    }
                  });
                }
              }
              await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            }),
            'adjust-and-clear'
          );
        } catch (err) {
          console.error(
            `[S${sessionId}] ⚠️ adjust-and-clear ultimately failed after retries: ${err.message}`
          );
          await incrementFailed();
        }

        sessionOrders++;
        if (sessionId === 1 && sessionOrders % perSessionRestock === 0) {
          await restockIfNeeded();
        }
      }

      // Write summary
      await sessionRetry(
        () => client.loadRunSummary.create({
          data: {
            runId,
            username,
            ordersCompleted: sessionOrders,
            startTime: sessionStart,
            endTime: new Date()
          }
        }),
        'write-summary'
      );
    })
  );

  // Cleanup
  console.log('› Cleaning up stray reservations…');
  await client.cartItem.deleteMany({});
  await client.$executeRawUnsafe(`
    UPDATE "Inventory"
    SET "onHand" = "onHand" + "reserved",
        "reserved" = 0
    WHERE "reserved" > 0
  `);

  // Order-status promotion (unchanged)...
  console.log('› Promoting some order statuses…');
  // ...omitted for brevity...

  // Finalize
  console.log('› Finalizing LoadRun…');
  await runWithRetry(
    () => client.loadRun.update({
      where: { id: runId },
      data: { endTime: new Date() }
    }),
    'finalize-run',
    5,
    null,
    incrementFailed
  );
}

async function main() {
  const [,, sessions, orders, interval, user='admin@cockroachlabs.com'] = process.argv;
  const runId = uuid();
  console.log(
    `\n🚀 Starting run ${runId} — ${sessions} sessions, ${orders} orders each, interval ${interval}\n`
  );
  try {
    await spawnRun(runId, user, +sessions, +orders, +interval);
  } catch (err) {
    console.error('❌ Load run failed:', err);
    process.exit(1);
  } finally {
    await client.$disconnect();
  }
  console.log('\n✅ All done.');
}

main();
