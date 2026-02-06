"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCTS } from "@/graphql/queries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  // We fetch a larger batch to improve likelihood of finding matches
  const { data, loading, error } = useQuery<any>(GET_PRODUCTS, {
    variables: { first: 50 },
    fetchPolicy: "cache-and-network"
  });

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Buscando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[50vh] text-center p-4">
        <p className="text-destructive font-medium mb-2">Error al cargar productos</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    );
  }

  const products = data?.products?.edges?.map((edge: any) => edge.node) || [];
  
  // Client-side filtering by name, tags, and sku
  const filteredProducts = products.filter((product: any) => {
    const searchLower = query.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.sku?.toLowerCase().includes(searchLower) ||
      product.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
    );
  });

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Resultados de Búsqueda
        </h1>
        <p className="text-muted-foreground">
            {query 
                ? `Mostrando resultados para "${query}"`
                : "No se ingresó término de búsqueda"
            }
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-secondary/10">
            <div className="bg-secondary/30 p-4 rounded-full mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No se encontraron productos</h2>
            <p className="text-muted-foreground max-w-md mb-6">
                No pudimos encontrar productos que coincidan con "{query}". Intenta verificar si hay errores o usa términos más generales.
            </p>
            <Button asChild>
                <Link href="/">Ver Todos los Productos</Link>
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product: any) => (
             <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <Suspense fallback={
          <div className="flex-1 flex flex-col justify-center items-center min-h-[50vh]">
             <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
      }>
        <SearchResults />
      </Suspense>
      <Footer />
    </div>
  );
}
