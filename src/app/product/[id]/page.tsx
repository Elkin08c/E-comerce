"use client";

import { useQuery } from "@apollo/client/react";
import { GET_PRODUCT } from "@/graphql/queries";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Loader2, ShoppingCart, Star, Heart, Share2, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { id },
    skip: !id,
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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center gap-4 text-center p-4">
          <h2 className="text-2xl font-bold text-destructive">Error loading product</h2>
          <p className="text-muted-foreground">{error.message}</p>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const product = data?.product;

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center gap-4 text-center p-4">
          <h2 className="text-2xl font-bold">Product not found</h2>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Image Section (Placeholder based on User Request) */}
            <div className="space-y-4">
                <div className="aspect-square bg-secondary/20 rounded-3xl overflow-hidden flex items-center justify-center border shadow-sm relative group">
                     {/* Placeholder for no backend images */}
                     <ShoppingCart className="h-32 w-32 text-muted-foreground/20" />
                     <div className="absolute top-4 left-4">
                         {product.stock <= 5 && (
                             <Badge variant="destructive" className="font-bold">Low Stock</Badge>
                         )}
                     </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                     {[1, 2, 3, 4].map((i) => (
                         <div key={i} className="aspect-square bg-secondary/10 rounded-xl cursor-pointer hover:ring-2 ring-primary transition-all"></div>
                     ))}
                </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8">
                <div>
                     <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-primary border-primary/20">New Arrival</Badge>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Share2 className="h-5 w-5 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Heart className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </div>
                     </div>
                     <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">{product.name}</h1>
                     <div className="flex items-center gap-4 mt-4">
                         <span className="text-3xl font-bold text-primary">${product.basePrice.toFixed(2)}</span>
                         {/* Placeholder for rating */}
                         <div className="flex items-center gap-1 text-sm">
                             <div className="flex text-yellow-500">
                                 <Star className="h-4 w-4 fill-current" />
                                 <Star className="h-4 w-4 fill-current" />
                                 <Star className="h-4 w-4 fill-current" />
                                 <Star className="h-4 w-4 fill-current" />
                                 <Star className="h-4 w-4 fill-current text-muted" />
                             </div>
                             <span className="text-muted-foreground">(24 reviews)</span>
                         </div>
                     </div>
                </div>

                <div className="prose prose-stone dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed text-muted-foreground">
                        {product.description || "No description available for this premium product. Experience quality and performance."}
                    </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-border">
                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2 border rounded-full p-1 pr-4">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" disabled={true}>-</Button>
                            <span className="font-bold w-4 text-center">1</span>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">+</Button>
                         </div>
                         <Button size="lg" className="flex-1 h-12 text-lg rounded-full shadow-lg shadow-primary/20">
                             Add to Cart
                         </Button>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <div>
                            <p className="font-semibold text-foreground">2 Year Warranty</p>
                            <p>Full coverage guarantee</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg">
                        <Loader2 className="h-5 w-5 text-primary" />
                         <div>
                            <p className="font-semibold text-foreground">Fast Delivery</p>
                            <p>2-3 business days</p>
                        </div>
                    </div>
                    {product.sku && (
                        <div className="col-span-2 text-xs">
                            SKU: <span className="font-mono">{product.sku}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
