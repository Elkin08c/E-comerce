"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  salePrice?: number;
  isActive: boolean;
  stock: number;
  tags?: string[];
}

interface ProductCardProps {
  product: Product;
}

import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.basePrice,
      salePrice: product.salePrice,
      quantity: 1,
      // image: product.mainImage // TODO: Map real image
    });
    toast.success("Agregado al carrito", {
      description: `${product.name} se ha agregado a tu carrito.`
    });
  };

  const hasDiscount = product.salePrice && product.salePrice > 0 && product.salePrice < product.basePrice;
  const discountPercent = hasDiscount && product.salePrice 
    ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100) 
    : 0;

  return (
    <Card className="group relative border-none shadow-none hover:shadow-xl transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-sm">
      <CardHeader className="p-0">
        <div className="aspect-[4/5] relative bg-secondary/20 overflow-hidden flex items-center justify-center">
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
            {product.stock <= 5 && product.stock > 0 && (
              <span className="bg-orange-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-sm w-fit">
                Pocas Unidades
              </span>
            )}
            {hasDiscount && (
              <span className="bg-destructive text-destructive-foreground text-[10px] uppercase font-bold px-2 py-1 rounded-sm w-fit">
                -{discountPercent}%
              </span>
            )}
          </div>
          {/* Placeholder for product image - In real app use Next.js Image */}
          <div className="group-hover:scale-105 transition-transform duration-500">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
            <Button variant="secondary" size="icon" className="rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75" onClick={handleAddToCart}>
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
            <p className="text-sm text-muted-foreground mt-1">Producto</p>
          </div>
          <div className="flex flex-col items-end">
            {hasDiscount && product.salePrice ? (
              <>
                <span className="text-lg font-bold text-destructive">${product.salePrice.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground line-through">${product.basePrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">${product.basePrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
