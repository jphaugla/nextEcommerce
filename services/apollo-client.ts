import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  ssrMode: true,
  uri: "https://graphqlecommerce.fly.dev/graphql",
  cache: new InMemoryCache(),
});

export default client;