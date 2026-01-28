"use client";

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, concat } from "@apollo/client";

const httpLink = new HttpLink({ 
  uri: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/graphql`,
  credentials: "include" 
});

const authMiddleware = new ApolloLink((operation, forward) => {
  let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  // Prevent sending "Bearer null" or "Bearer undefined"
  if (!token || token === "null" || token === "undefined") {
    token = null;
  }
  
  const headers: Record<string, string> = {};
  if (token && token !== "null" && token !== "undefined") {
      headers["Authorization"] = `Bearer ${token}`;
  }
  
  operation.setContext((prevContext: any) => ({
    headers: {
      ...prevContext.headers,
      ...headers
    }
  }));

  return forward(operation);
});

export const client = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache({
  }),
});
