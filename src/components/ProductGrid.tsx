"use client";

import { useQuery } from "@apollo/client/react";
import { GET_PRODUCTS } from "@/graphql/queries";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  basePrice: number;
  isActive: boolean;
  stock: number;
  tags: string[];
}

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
        <Card key={product.id} className="group relative border-none shadow-none hover:shadow-xl transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="p-0">
             <div className="aspect-[4/5] relative bg-secondary/20 overflow-hidden flex items-center justify-center">
                 <div className="absolute top-2 left-2 z-10 flex gap-2">
                    {product.stock <= 5 && product.stock > 0 && (
                        <span className="bg-orange-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-sm">
                            Low Stock
                        </span>
                    )}
                 </div>
                 {/* Placeholder for product image - In real app use Next.js Image */}
                 <div className="group-hover:scale-105 transition-transform duration-500">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
                 </div>
                 
                 {/* Quick Actions Overlay */}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <Button variant="secondary" size="icon" className="rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                         <ShoppingBag className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="icon" className="rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                         <Link href={`/product/${product.id}`} className="flex items-center justify-center w-full h-full">
                            <Search className="h-4 w-4" />
                         </Link>
                    </Button>
                 </div>
             </div>
          </CardHeader>
          <CardContent className="pt-4 px-2">
            <div className="flex justify-between items-start">
                <div>
                     <CardTitle className="text-base font-medium line-clamp-1">{product.name}</CardTitle>
                     <p className="text-sm text-muted-foreground mt-1">Category Name</p> 
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-primary">${product.basePrice.toFixed(2)}</span>
                </div>
            </div>
          </CardContent>
          {/* Footer removed for cleaner look, actions are on hover */}
        </Card>
      ))}
    </div>
  );
}
