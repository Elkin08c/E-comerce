"use client";

import { useQuery } from "@apollo/client/react";
import { GET_CATEGORY_BY_SLUG } from "@/graphql/queries";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProductCard, Product } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data, loading, error } = useQuery<any>(GET_CATEGORY_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !data?.categoriesBySlug || data.categoriesBySlug.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center gap-4 text-center p-4">
          <h2 className="text-2xl font-bold text-destructive">Category not found</h2>
          <p className="text-muted-foreground">{error?.message || "Verify the URL or go back to home"}</p>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const category = data.categoriesBySlug[0];
  const products = category.products || [];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Catalog
            </Link>
        </div>

        <div className="mb-10 text-center">
             <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-foreground">{category.name}</h1>
             {category.description && (
                <p className="text-muted-foreground max-w-2xl mx-auto">{category.description}</p>
             )}
        </div>

        {products.length === 0 ? (
             <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
                No products found in this category.
             </div>
        ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
