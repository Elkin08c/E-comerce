"use client";

import { useQuery } from "@apollo/client/react";
import { GET_PRODUCTS } from "@/graphql/queries";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ProductCard, Product } from "./ProductCard";



export default function ProductGrid() {
  const { data, loading, error } = useQuery<any>(GET_PRODUCTS, {
    variables: { first: 12 },
  });

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12 text-red-500">
        Error loading products: {error.message}
      </div>
    );
  }

   const products = data?.products?.edges?.map((edge: { node: Product }) => edge.node) || [];

  if (products.length === 0) {
    return (
      <div className="text-center p-12 text-muted-foreground">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 sm:px-6 lg:px-8 py-8">
      {products.map((product: Product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
