"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

export interface Product {
  id: string;
  name: string;
  slug?: string;
  basePrice: number;
  salePrice?: number;
  isActive: boolean;
  stock?: number; // Optional - backend may not expose this
  tags?: string[];
  images?: Array<{
    id: string;
    url: string;
    altText?: string;
    isMain: boolean;
  }>;
}

interface ProductCardProps {
  product: Product;
}

import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  
  // Handle optional stock field - default to available if not provided
  const stock = product.stock ?? 100; // Default to 100 if backend doesn't provide stock
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) {
      toast.error("Producto sin stock", {
        description: "Este producto no está disponible actualmente."
      });
      return;
    }
    
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
        <div className="aspect-4/5 relative bg-secondary/20 overflow-hidden flex items-center justify-center">
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
            {isOutOfStock && (
              <span className="bg-gray-800 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-sm w-fit">
                Sin Stock
              </span>
            )}
            {isLowStock && (
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
          {/* Product Image */}
          <div className="group-hover:scale-105 transition-transform duration-500 w-full h-full flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images.find(img => img.isMain)?.url || product.images[0].url}
                alt={product.images.find(img => img.isMain)?.altText || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
            )}
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75" 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              title={isOutOfStock ? "Sin stock" : "Agregar al carrito"}
            >
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
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <CardTitle className="text-base font-medium line-clamp-1">{product.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Producto</p>
          </div>
          <div className="flex flex-col items-end">
            {hasDiscount && product.salePrice ? (
              <>
                <span className="text-lg font-bold text-destructive">${(product.salePrice || 0).toFixed(2)}</span>
                <span className="text-sm text-muted-foreground line-through">${(product.basePrice || 0).toFixed(2)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">${(product.basePrice || 0).toFixed(2)}</span>
            )}
          </div>
        </div>
        
        {/* Stock Indicator */}
        {!isOutOfStock && product.stock !== undefined && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Stock disponible</span>
              <span className={`font-semibold ${
                stock > 10 ? 'text-green-600' : 
                stock > 5 ? 'text-yellow-600' : 
                'text-orange-600'
              }`}>
                {stock} unidades
              </span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  stock > 10 ? 'bg-green-500' : 
                  stock > 5 ? 'bg-yellow-500' : 
                  'bg-orange-500'
                }`}
                style={{ width: `${Math.min((stock / 20) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
