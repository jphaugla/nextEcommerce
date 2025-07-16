#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { randomInt }     = require('crypto');
const { v4: uuid }      = require('uuid');

const client = new PrismaClient();

// retry wrapper (unchanged)
async function runWithRetry(fn, tag, retries = 5, sessionId = null, incrementFailed = null) {
  const txId = uuid().slice(0, 6);
  const retryRegex = new RegExp(
    ['deadlock','conflict','serialization failure',
     'please retry your transaction','server has closed the connection',
     "can't reach database server"].join('|'),
    'i'
  );

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
      if (!isTransient || attempt === retries) {
        console.error(
          `${prefix}❌ tx [${tag}] id=${txId} failed${isTransient ? ` after ${retries} attempts` : ''}: ${msg}`
        );
        if (incrementFailed) await incrementFailed();
        throw err;
      }
      console.warn(
        `${prefix}⚠️ tx [${tag}] id=${txId} transient error on attempt ${attempt}: ${msg}`
      );
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
}

async function spawnRun(runId, initiator, numSessions, numOrders, restockInterval) {
  // bump LoadRun.failed on hard errors
  const incrementFailed = () =>
    client.loadRun.update({ where: { id: runId }, data: { failed: { increment: 1 } } });

  console.log('› Truncating old reservations…');
  await client.cartReservation.deleteMany({});

  console.log('› Preloading products…');
  const allItems = await client.item.findMany({
    select: { id: true, stock: true, price: true, description: true, src: true }
  });

  async function restockIfNeeded() {
    const invs = await client.inventory.findMany({
      select: { id: true, onHand: true, threshold: true, restockAmount: true }
    });
    const low = invs.filter(i => i.onHand < i.threshold);
    if (!low.length) return;
    console.log(`› Restocking ${low.length} items…`);
    await runWithRetry(
      () => Promise.all(low.map(inv =>
        client.inventory.update({
          where: { id: inv.id },
          data: {
            onHand: { increment: inv.restockAmount },
            transactions: { create: { change: inv.restockAmount, type: 'RESTOCK', reference: runId } }
          }
        })
      )),
      'restock', 5, null, incrementFailed
    );
  }

  await runWithRetry(
    () => client.loadRun.create({
      data: { id: runId, userEmail: initiator, numSessions, numOrders, failed: 0 }
    }),
    'load-run-init', 5, null, incrementFailed
  );

  const perSessionRestock = Math.max(1, Math.floor(restockInterval / numSessions));

  await Promise.all(
    Array.from({ length: numSessions }).map(async (_, idx) => {
      const sessionId = idx + 1;
      await new Promise(r => setTimeout(r, randomInt(0, 500)));
      const username = idx === 0
        ? initiator
        : `${String(randomInt(0, 2000)).padStart(4, '0')}@cockroachlabs.com`;
      const sessionRetry = (fn, tag) => runWithRetry(fn, tag, 5, sessionId, incrementFailed);

      console.log(`[S${sessionId}] --- Session ${sessionId}/${numSessions}: ${username} ---`);

      // upsert user & cart
      const user = await sessionRetry(
        () => client.user.upsert({
          where: { email: username },
          update: {},
          create: { email: username }
        }),
        'upsert-user'
      );
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
        const picked = allItems
          .map(it => ({ ...it, rnd: Math.random() }))
          .sort((a, b) => a.rnd - b.rnd)
          .slice(0, randomInt(1, 8));

        // A) Reserve + record
        await sessionRetry(
          () => client.$transaction(async tx => {
            for (const { id: itId, stock } of picked) {
              const qty = stock > 1 ? randomInt(1, 4) : 1;
              await tx.cartItem.upsert({
                where: { cartId_itemId: { cartId: cart.id, itemId: itId } },
                update: { quantity: { increment: qty } },
                create: { cartId: cart.id, itemId: itId, quantity: qty }
              });
              await tx.inventory.update({
                where: { itemId: itId },
                data: {
                  reserved: { increment: qty },
                  onHand: { decrement: qty }
                }
              });
              await tx.cartReservation.create({
                data: { cartId: cart.id, itemId: itId, quantity: qty }
              });
            }
          }),
          'reserve-cart', 5, sessionId, incrementFailed
        );

        // B) Create order
        const newOrder = await sessionRetry(
          () => client.order.create({
            data: {
              userId: user.id,
              totalCents: picked.reduce((s, { price }) => s + Math.round(price * 100), 0),
              items: {
                create: picked.map(({ id, price, description, src }) => ({
                  itemId: id,
                  quantity: 1,
                  priceCents: Math.round(price * 100),
                  description,
                  src
                }))
              }
            }
          }),
          'create-order', 5, sessionId, incrementFailed
        );

        // C) Adjust per item
        for (const { id: itemId } of picked) {
          const inv = await client.inventory.findUnique({
            where: { itemId },
            select: { id: true, onHand: true, reserved: true }
          });
          if (!inv) continue;

          await sessionRetry(
            () => client.$transaction(async tx => {
              if (inv.onHand > 0) {
                await tx.inventory.update({
                  where: { id: inv.id },
                  data: {
                    onHand: { decrement: 1 },
                    reserved: { decrement: 1 },
                    transactions: { create: { change: -1, type: 'SALE', reference: newOrder.id } }
                  }
                });
              } else {
                const releaseQty = Math.min(inv.reserved, 1);
                await tx.inventory.update({
                  where: { id: inv.id },
                  data: {
                    reserved: { decrement: releaseQty },
                    transactions: {
                      create: [
                        { change: -releaseQty, type: 'RELEASE', reference: newOrder.id },
                        { change: 0, type: 'OUT_OF_STOCK', reference: newOrder.id }
                      ]
                    }
                  }
                });
              }
            }),
            'adjust-item', 5, sessionId, incrementFailed
          );
        }

        // D) Clear cart items + reservations
        await sessionRetry(
          () => client.$transaction(tx => {
            tx.cartReservation.deleteMany({ where: { cartId: cart.id } });
            tx.cartItem.deleteMany({      where: { cartId: cart.id } });
          }),
          'clear-cart', 5, sessionId, incrementFailed
        );

        // E) Periodic restock
        sessionOrders++;
        if (sessionId === 1 && sessionOrders % perSessionRestock === 0) {
          await restockIfNeeded();
        }
      }

      // 5) Write summary
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
        'write-summary', 5, sessionId, incrementFailed
      );
    })
  );

  // Final sweep of any stray reservations
  console.log('› Final cleanup of any stray reservations…');
  await client.cartReservation.deleteMany({});

  // Zero out reserved without adding back to onHand
  console.log('› Zeroing out any remaining reserved…');
  await client.$executeRawUnsafe(`
    UPDATE "Inventory"
    SET "reserved" = 0
    WHERE reserved > 0;
  `);

  // Promote order statuses in one statement
  console.log('› Promoting order statuses…');
  await client.$executeRawUnsafe(`
    UPDATE "Order"
    SET status = CASE
      WHEN status = 'PENDING'           AND random() < 0.40 THEN 'PROCESSING'
      WHEN status = 'PROCESSING'        AND random() < 0.30 THEN 'SHIPPED'
      WHEN status = 'SHIPPED'           AND random() < 0.60 THEN 'OUT FOR DELIVERY'
      WHEN status = 'OUT FOR DELIVERY'  AND random() < 0.80 THEN 'DELIVERED'
      WHEN status = 'DELIVERED'         AND random() < 0.90 THEN 'COMPLETED'
      ELSE status
    END
    WHERE status IN (
      'PENDING','PROCESSING','SHIPPED',
      'OUT FOR DELIVERY','DELIVERED'
    );
  `);

  // Finalize the load run
  console.log('› Finalizing LoadRun…');
  await runWithRetry(
    () => client.loadRun.update({ where: { id: runId }, data: { endTime: new Date() } }),
    'finalize-run', 5, null, incrementFailed
  );
}

async function main() {
  const [,, sessions, orders, interval, user = 'admin@cockroachlabs.com'] = process.argv;
  const runId = uuid();
  console.log(`🚀 Starting run ${runId} — ${sessions} sessions, ${orders} orders each, interval ${interval}`);
  try {
    await spawnRun(runId, user, +sessions, +orders, +interval);
  } catch (e) {
    console.error('❌ Load run failed:', e);
    process.exit(1);
  } finally {
    await client.$disconnect();
  }
  console.log('✅ All done.');
}

main();
