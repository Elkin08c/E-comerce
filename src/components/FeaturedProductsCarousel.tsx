"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCTS } from "@/graphql/queries";
import { ProductCard, Product } from "./ProductCard";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export default function FeaturedProductsCarousel() {
  const { data, loading, error } = useQuery<any>(GET_PRODUCTS, {
    variables: { first: 8 }, // Limit to 8 products for featured section
  });
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const products = data?.products?.edges?.map((edge: { node: Product }) => edge.node) || [];

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [products]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) return null;

  if (products.length === 0) return null;

  return (
    <div className="relative group">
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Productos Destacados</h2>
          <p className="text-muted-foreground mt-1">Nuestra selección premium para tu industria</p>
        </div>
        <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollLeft}
              disabled={!showLeftArrow}
              className="rounded-full hidden sm:flex hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollRight}
              disabled={!showRightArrow}
              className="rounded-full hidden sm:flex hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product: Product) => (
          <div key={product.id} className="min-w-[280px] sm:min-w-[300px] snap-center">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      
      {/* Mobile visible arrows overlay - only show if scrolling is possible */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 sm:hidden z-10">
        {showLeftArrow && (
            <Button
            variant="secondary"
            size="icon"
            onClick={scrollLeft}
            className="rounded-full shadow-lg h-8 w-8 ml-2 bg-background/80 backdrop-blur-sm border"
            >
            <ChevronLeft className="h-4 w-4" />
            </Button>
        )}
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-0 sm:hidden z-10">
         {showRightArrow && (
            <Button
            variant="secondary"
            size="icon"
            onClick={scrollRight}
            className="rounded-full shadow-lg h-8 w-8 mr-2 bg-background/80 backdrop-blur-sm border"
            >
            <ChevronRight className="h-4 w-4" />
            </Button>
         )}
      </div>
    </div>
  );
}
