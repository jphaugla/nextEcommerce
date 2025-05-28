# NextEcommerce

This is the **NextEcommerce** demo: a Next.js + CockroachDB + Prisma storefront with inventory management and load testing tools.

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
