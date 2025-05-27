This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Links
- https://squarenext.example.com/

## Getting Started

### clone repository
```bash
git clone https://github.com/jphaugla/nextEcommerce.git
cd nextEcommerce
```

### install dependencies
```bash
npm install
```

### CockroachDB setup

1. Create a new file called `.env` with:
   ```env
   COCKROACH_DB_URL="postgresql://root@localhost:26257/ecommerce?insecure"
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   ```
2. Apply schema changes and create tables:
   ```bash
   npx prisma migrate dev --name init
   ```

### run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Technical Overview

This project provides:

- **User authentication** via NextAuth and Google.
- **Shopping cart** and **checkout** backed by Prisma + CockroachDB.
- **Inventory management** with real-time `onHand` and `reserved` counts, plus an audit log (`InventoryTransaction`).
- A custom **“Generate Load”** page to simulate concurrent load against the system:

  - **Parameters**:  
    - **Sessions**: number of parallel user sessions.  
    - **Orders per Session**: how many orders each session will place.  
    - **Restock Interval**: total orders across all sessions before automatic restock.
  - **Behavior**:  
    1. Spins up N sessions, each inserting random cart items and placing orders.  
    2. Session 0 tracks its completed-order count and, every `floor(restockInterval / sessions)` orders, triggers a restock.  
    3. Restocks top up any SKU whose `onHand` has fallen below its own `threshold`, using that row’s `restockAmount`, and log a `RESTOCK` in `InventoryTransaction`.  
    4. Built-in retry logic handles CockroachDB write-conflicts on hot inventory rows.

### Key Prisma Models

```prisma
model Inventory {
  id             String      @id @default(uuid())
  itemId         String      @unique
  onHand         Int         @default(0)
  reserved       Int         @default(0)
  threshold      Int         @default(10)
  restockAmount  Int         @default(50)
  lastAdjustedAt DateTime    @updatedAt
  transactions   InventoryTransaction[]
}

model InventoryTransaction {
  id            String    @id @default(uuid())
  inventoryId   String
  change        Int
  type          String
  reference     String?
  createdAt     DateTime  @default(now())
}
```

### Generate-Load Page Flow

1. **User inputs** “Sessions”, “Orders per Session”, and “Restock Interval” (defaults: 5, 10, 200).  
2. These values are **persisted** in `localStorage` so they survive reloads.  
3. On **Start Load**, the page POSTs to `/api/generate-load`.  
4. Internally, the handler:
   - Preloads all product `Item` rows.  
   - Creates a `LoadRun` record.  
   - Spawns N parallel loops (“sessions”), each:
     1. Upserts a fake user & their cart.  
     2. For each order:  
        - Picks 1–8 random SKUs with random quantities.  
        - Reserves stock (`reserved += qty`).  
        - Creates an `Order` + `OrderItem` snapshot.  
        - Either sells (`onHand -= qty; reserved -= qty; log SALE`) or, if out of stock, **releases** the reservation and logs both `RELEASE` and `OUT_OF_STOCK` in one atomic update.  
        - Clears the cart.  
     3. Session 0, every `floor(restockInterval/sessions)` orders, runs `restockIfNeeded()`:
        - Finds all Inventory rows with `onHand < threshold`.  
        - Increments each `onHand` by its `restockAmount` and logs `RESTOCK`.  
   - Each transactional block is wrapped in a **retryable** helper that retries CockroachDB write-conflicts up to 5 times with exponential back-off.  
5. Results are summarized per session in a `LoadRunSummary` table and polled back to the UI.

This approach ensures controlled, configurable load testing, automatic restocks, and accurate real-time inventory tracking.

---

## API Routes

- **`GET /api/load-summary?runId=…`**  
  Returns JSON array of `{ username, ordersCompleted, startTime, endTime }` for the given load run.
- **`POST /api/generate-load?user=…`**  
  Body: `{ numSessions, numOrders, restockInterval }`  
  Kicks off the load routine described above.

---

## Development Notes

- To reset **all** reserved counts in CockroachDB without safe-update errors:
  ```sql
  UPDATE "Inventory"
  SET "reserved" = 0
  WHERE true;
  ```
- Prisma logging is configured to suppress raw SQL; enable `"query"` in the client’s `log` settings if you need to troubleshoot.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)  
- [CockroachDB + Prisma Guide](https://www.cockroachlabs.com/docs/stable/build-a-nodejs-app-with-cockroachdb-prisma)  
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
