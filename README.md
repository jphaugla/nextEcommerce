# NextEcommerce

This is the **NextEcommerce** demo: a Next.js + CockroachDB + Prisma storefront with inventory management and load testing tools.
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
NOTE:  subsequent steps explain how to setup the two google environment variables
   ```env
   COCKROACH_DB_URL="postgresql://root@localhost:26257/ecommerce?insecure"
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   ```
When deploying this application on a cloud provider, there are additional steps
NOTE:  the NEXTAUTH_URL is the DNS name of your cloud application VM. for AWS will look like *http://ec2-blah-blah-blah.us-east-2.compute.amazonaws.com*   However, old AWS regions like us-east-1 do not work as their DNS name doesn't *qualify* for GCP authorization.  These old regions will loook like *ec2-whatever-ip-is.compute-1.amazonaws.com*.  The error message in the Google Cloud authorization is *Invalid Redirect: must use a domain that is a valid top private domain*
ADDITIONAL NOTE:  if running multi-region only run the *npx prisma db push* command on one of the application nodes.  The other steps need to be done on all regional applications.
   ```env
   COCKROACH_DB_URL="postgresql://jhaugland:jasonrocks@jhaug-east2-private-nlb-fd43cbfa6b362538.elb.us-east-2.amazonaws.com:26257/ecommerce?sslmode=disable"
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   NEXTAUTH_URL=http://ec2-blah-blah-blah.us-east-2.compute.amazonaws.com:3000
   ```
2. Set up google [OAuth client ID credentials](https://developers.google.com/workspace/guides/create-credentials#oauth-client-id)
   - Open the Google Cloud Console → APIs & Services → Credentials
   - Find your OAuth 2.0 Client ID (the “Web application” entry). 
     - if running local this is *Authorized JavaScript Origin*:
     ```bash
     http://localhost:3000
     ```
     - if running *local* this is *Redirect URIs*:
     ```bash
     http://localhost:3000/api/auth/callback/google
     ```
     - if running *self managed in the cloud* this is *Authorized JavaScript Origin:*
     ```bash
     http://ec2-blah-blah-blah.us-east-2.compute.amazonaws.com:3000
     ```
     - if running in *self managed in the cloud* this is *Redirect URIs*:
     ```bash
     http://ec2-blah-blah-blah.us-east-2.compute.amazonaws.com:3000/api/auth/callback/google
     ```
2. Apply schema changes and create tables (only run once in multi-region):
   ```bash
   source .env
   npx prisma db push 
   ```
2a. When this is not on the first node may still need to rebuild the client
   ```bash
   source .env
   npx prisma generate
   ```

3. Seed the catalog item   (only run once in multi-region):
   ```bash
   source .env
   npm run seed
   ```

### run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
or 
Open [http://ec2-blah-blah-blah.us-east-2.compute.amazonaws.com:3000](http:///ec2-blah-blah-blah.us-east-2.compute.amazonaws.com:3000)

### run the load from prompt
The load can be kicked off from the application but is also set up to run as a script.  To run as a script
```bash
npm run load
```

Can edit the load parameters by changing this line *load:node scripts/run-load.js 5 2000 40,* in [package.json](package.json)
where 5 is number of sessions, 2000 is number of orders per session, and 40 is restock interval
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
## Screenshots

### Home Page
![Home Page](images/Home.png)

*File: `pages/index.tsx`*  
Basic homepage listing products, using `getServerSideProps` to fetch items from Prisma and render a grid of product cards.

---

### Product Detail Page
![Product Detail](images/Home.png)

*File: `pages/items/[id].tsx`*  
Dynamic route for individual product, using `getStaticPaths` + `getStaticProps` to pre-render pages.

---

### Cart Page
![Cart Page](images/Cart.png)

*File: `pages/cart.tsx`*  
Interactive cart showing items in your cart, quantities, and checkout button. Uses API routes to add/remove items.

---

### Order History
![Orders Page](images/OrderHistory.png)

*File: `pages/orders.tsx`*  
Protected page listing past orders for the signed-in user, fetched in `getServerSideProps`.

---

### Inventory Management
![Inventory Page](images/inventory.png)

*File: `pages/inventory.tsx`*  
Displays current stock levels (`onHand`, `reserved`, thresholds) fetched via `getServerSideProps`.  
Includes "Restock Inventory" button that calls `/api/restock`.

---

### Inventory Transactions
![Inventory Transactions](images/inventory-transactions.png)

*File: `pages/inventory-transactions.tsx`*  
Shows audit log of inventory adjustments, loaded via `getServerSideProps` from `InventoryTransaction` table.

---

### Generate Load
![Generate Load](images/GenerateLoad.png)

*File: `pages/generate-load.tsx`*  
UI to simulate concurrent sessions placing orders. Parameters persisted in `localStorage`.  
Starts load via `/api/generate-load`, polls `/api/load-summary`.

---

## Navbar Usage

The `components/navbar/Navbar.tsx` defines links based on authentication state:

```tsx
<Link href="/" className="hover:underline">Home</Link>
<Link href="/about" className="hover:underline">About</Link>
<Link href="/contact" className="hover:underline">Contact</Link>
{session && (
  <>
    <Link href="/orders" className="hover:underline">Order History</Link>
    <Link href="/generate-load" className="hover:underline">Generate Load</Link>
    <Link href="/inventory" className="hover:underline">Inventory</Link>
    <Link href="/inventory-transactions" className="hover:underline">Inventory Transactions</Link>
  </>
)}
<Link href="/cart" className="relative">... cart icon ...</Link>
```

Authentication buttons:

```tsx
{!session ? (
  <button onClick={() => signIn("google")}>Sign In</button>
) : (
  <button onClick={() => signOut()}>Sign Out</button>
)}
```

Cart badge count:

```tsx
{badgeCount > 0 && <span className="absolute ...">{badgeCount}</span>}
```

---

## Adding New Pages

1. Create a file under `pages/`, e.g. `pages/your-new-page.tsx`.  
2. Use Next.js data-fetching (`getServerSideProps`, `getStaticProps`) or React hooks as needed.  
3. Import and add a `<Link href="/your-new-page">…</Link>` entry in `components/navbar/Navbar.tsx`.

---

## Development Notes

- To reset **all** reserved counts in CockroachDB without safe-update errors:
  ```sql
  UPDATE "Inventory"
  SET "reserved" = 0
  WHERE true;
  ```
- Prisma client logging is configured to omit raw SQL. Enable `"query"` in `new PrismaClient({ log: [...] })` if you need to debug SQL.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)  
- [CockroachDB + Prisma Guide](https://www.cockroachlabs.com/docs/stable/build-a-nodejs-app-with-cockroachdb-prisma)  
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma ORM](https://www.prisma.io/docs/orm)
- [Terraform/Ansible Deployment github](https://github.com/jphaugla/crdb-terraform-ansible)
- [Google OAuth client setup](https://developers.google.com/workspace/guides/create-credentials#oauth-client-id)
