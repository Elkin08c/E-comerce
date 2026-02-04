"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCTS, GET_CATEGORIES } from "@/graphql/queries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Loader2, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Reuse Product interface from ProductCard or define local if needed, 
// using 'any' for now to avoid duplications in this specific file if ProductCard doesn't export it well,
// but simpler to just trust the data shape.

export default function CatalogPage() {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Fetch Categories
  const { data: catData, loading: catLoading } = useQuery<any>(GET_CATEGORIES);
  const categories = catData?.categories?.edges?.map((e: any) => e.node) || [];

  // Fetch Products (fetching a larger batch for client-side filtering demo)
  const { data: prodData, loading: prodLoading, error: prodError } = useQuery<any>(GET_PRODUCTS, {
    variables: { first: 100 }, // Fetch up to 100 items
  });

  const products = useMemo(() => {
    return prodData?.products?.edges?.map((e: any) => e.node) || [];
  }, [prodData]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      // 1. Category Filter
      // Note: We updated query to fetch 'category: categoryId'. 
      // If product has no category, it passes if no category selected.
      if (selectedCategories.length > 0) {
        if (!product.category || !selectedCategories.includes(product.category)) {
            return false;
        }
      }

      // 2. Price Filter
      const price = product.salePrice || product.basePrice || 0;
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [products, selectedCategories, priceRange]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) 
        ? prev.filter(c => c !== catId)
        : [...prev, catId]
    );
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Categorías</h3>
        {catLoading ? (
            <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-4 bg-secondary/30 rounded w-2/3 animate-pulse" />)}
            </div>
        ) : (
            <div className="space-y-2">
            {categories.map((cat: any) => (
                <div key={cat.id} className="flex items-center space-x-2">
                <Checkbox 
                    id={cat.id} 
                    checked={selectedCategories.includes(cat.id)}
                    onCheckedChange={() => toggleCategory(cat.id)}
                />
                <Label 
                    htmlFor={cat.id} 
                    className="text-sm font-normal cursor-pointer hover:text-primary transition-colors"
                >
                    {cat.name}
                </Label>
                </div>
            ))}
            </div>
        )}
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Precio</h3>
            <span className="text-sm text-foreground font-medium">
                ${priceRange[0]} - ${priceRange[1]}
            </span>
         </div>
         <Slider
            defaultValue={[0, 2000]}
            max={5000}
            step={10}
            value={priceRange}
            onValueChange={(val) => setPriceRange([val[0], val[1]])}
            className="py-4"
         />
      </div>
      
      {(selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 2000) && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => {
                setSelectedCategories([]);
                setPriceRange([0, 2000]);
            }}
          >
              Limpiar Filtros
          </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8">
            
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0 space-y-8 sticky top-24 self-start h-[calc(100vh-8rem)] overflow-y-auto pr-4">
                <div>
                   <h2 className="text-2xl font-bold mb-6">Filtros</h2>
                   <FilterContent />
                </div>
            </aside>

            {/* Mobile Filter Trigger */}
            <div className="md:hidden mb-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full flex gap-2">
                             <Filter className="h-4 w-4" />
                             Filtrar Productos
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <SheetHeader>
                            <SheetTitle>Filtros</SheetTitle>
                            <SheetDescription>Ajusta tu búsqueda</SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <FilterContent />
                        </div>
                        <SheetFooter>
                           
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Grid */}
            <div className="flex-1">
                <div className="mb-6 flex items-center justify-between">
                     <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
                     <span className="text-muted-foreground text-sm">
                        {filteredProducts.length} resultados
                     </span>
                </div>
                
                {prodLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                 ) : prodError ? (
                    <div className="text-center py-20 text-destructive">
                        Error al cargar productos: {prodError.message}
                    </div>
                 ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-secondary/5">
                        <Filter className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                        <h2 className="text-xl font-semibold mb-2">No se encontraron productos</h2>
                        <p className="text-muted-foreground">Intenta ajustar tus filtros</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {filteredProducts.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
