"use client";

import { ApolloProvider } from "@apollo/client/react";
import { client } from "@/lib/apollo";
import { CartInitializer } from "./cart-initializer";

import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <CartInitializer>
        {children}
      </CartInitializer>
      <Toaster position="top-center" richColors />
    </ApolloProvider>
  );
}
