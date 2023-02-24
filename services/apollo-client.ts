import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  ssrMode: true,
  uri: "https://misty-night-9009.fly.dev/graphql",
  cache: new InMemoryCache(),
});

export default client;