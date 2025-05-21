This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Links
- https://squarenext.vercel.app/

## Getting Started

### clone repository
```bash
git clone https://github.com/jphaugla/nextEcommerce.git
```
### install dependencies
npm install

### if you want to run cockroachdb

- create a new file called .env.local and set the COCKROACH_DB_URL environment variable 
- apply schema changes and create tables
```bash
edit .env/.env.local to add
COCKROACH_DB_URL="postgresql://root@localhost:26257/ecommerce?insecure"
npx prisma migrate dev --name init
```

run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

To learn about cockroachDB and prisma
- [cockroachdb prisma](https://www.cockroachlabs.com/docs/stable/build-a-nodejs-app-with-cockroachdb-prisma)

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


# TO DO:
- ~~Fix navbar link displays~~
- ~~Add uuid for sample Data to do Key~~
- ~~Create Sidebar~~
- ~~Get Icons for Sidebar Component~~
- ~~Style Sidebar Component~~
- ~~Create individual product pages~~
- ~~Link a database to next-auth~~
- ~~Add a cart SVG in corner~~
- ~~Add hamburger menu for navbar~~
- ~~Create cart in database for each user~~
- ~~Create crud operations for database~~
- ~~Create a cart page with a checkout link~~
- Create checkout page
- Integrate square with env variables
- ~~Create a contact page~~
- Create a profile page
- ~~Create an about page~~ 
- ~~Add 2xl breakpoint in CSS~~
- ~~Make homepage responsive in 2xl~~
- ~~Create express graphQL app for sample data~~
- ~~Add Apollo Client to frontend~~
- ~~Link database with products~~
- ~~fix graphql refetch bug for Cart and navigation bar~~
- ~~Create removeCartItem hook~~
- ~~Check if increment and decrement cart item hooks work~~
- ~~Add cart hooks to cart page~~
- Add input for item page so a specified amount can be added
- Add payment page for cart
- Add Stripe or Square to enable purchasing
- Make resolvers and schema for orders on the backend
- Update the profile page to show previous purchases
