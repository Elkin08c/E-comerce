"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const httpLink = new HttpLink({ 
  uri: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/graphql`,
  credentials: "include" 
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
  }),
});
