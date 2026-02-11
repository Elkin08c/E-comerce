"use client";

import { useQuery } from "@apollo/client/react";
import { GET_PRODUCT } from "@/graphql/queries";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, ShoppingCart, Star, Heart, Share2, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { useState } from "react";

// Define manual types for the product query
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  salePrice: number;
  costPrice: number;
  status: string;
  hasVariants: boolean;
  isFeatured: boolean;
  tags: string[];
  categoryId: string;
  metaTitle: string;
  metaDescription: string;
  variants: {
    id: string;
    name: string;
    sku: string;
    salePrice: number;
    costPrice: number;
    attributes: {
      color?: string;
      storage?: string;
      size?: string;
      material?: string;
      other?: string;
    };
  }[];
  stock?: number;
  availableStock?: number;
  basePrice: number;
  sku: string;
  images?: {
    url: string;
    altText?: string;
  }[];
}

interface GetProductQuery {
  product: Product;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { addItem, openCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const { data, loading, error } = useQuery<GetProductQuery>(GET_PRODUCT, {
    variables: { id },
    skip: !id,
  });

  const product = data?.product || null;

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
          <h2 className="text-2xl font-bold text-destructive">Error al cargar producto</h2>
          <p className="text-muted-foreground">{error.message}</p>
          <Button asChild variant="outline">
            <Link href="/catalog">Volver al Catálogo</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Stock validation
  // Use availableStock if present, otherwise fallback to stock (though backend should always return availableStock now)
  const currentStock = product?.availableStock ?? product?.stock ?? 0;
  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock <= 5;
  const maxQuantity = currentStock;

  // Handle add to cart with validation
  const handleAddToCart = async () => {
    if (!product) {
      toast.error("Producto no encontrado");
      return;
    }

    if (isOutOfStock) {
      toast.error("Producto sin stock");
      return;
    }

    if (quantity > maxQuantity) {
      toast.error(`Solo hay ${maxQuantity} unidades disponibles`);
      return;
    }

    setIsAdding(true);
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.salePrice || 0,
        salePrice: product.costPrice && product.costPrice < product.salePrice ? product.costPrice : undefined,
        quantity: quantity,
        image: product.images?.[0]?.url,
      });
      toast.success(`${quantity} ${quantity === 1 ? 'unidad agregada' : 'unidades agregadas'} al carrito`);
      
      // Auto-open cart after adding item
      openCart();
    } catch (error) {
      toast.error("Error al agregar al carrito");
    } finally {
      setIsAdding(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center gap-4 text-center p-4">
          <h2 className="text-2xl font-bold">Producto no encontrado</h2>
          <Button asChild variant="outline">
            <Link href="/catalog">Regresar al Catálogo</Link>
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
          <Link href="/catalog" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Catálogo
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Section (Placeholder based on User Request) */}
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-secondary/20 rounded-3xl overflow-hidden flex items-center justify-center border shadow-sm relative group">
              {product.images?.[0]?.url ? (
                <img
                  src={product.images[0].url}
                  alt={product.images[0].altText || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShoppingCart className="h-32 w-32 text-muted-foreground/20" />
              )}
              <div className="absolute top-4 left-4">
                {isLowStock && (
                  <Badge variant="destructive" className="font-bold">Pocas Unidades</Badge>
                )}
              </div>
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, i) => (
                  <div key={i} className="aspect-square bg-secondary/10 rounded-xl cursor-pointer hover:ring-2 ring-primary transition-all overflow-hidden">
                    <img src={img.url} alt={img.altText || `View ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            {(!product.images || product.images.length <= 1) && (
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-secondary/10 rounded-xl cursor-pointer hover:ring-2 ring-primary transition-all"></div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-primary border-primary/20">Novedad</Badge>
                  {product.salePrice && product.salePrice > 0 && product.salePrice < product.basePrice && (
                    <Badge variant="destructive">
                      {Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)}% OFF
                    </Badge>
                  )}
                </div>
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
                {product.salePrice && product.salePrice > 0 ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-destructive">${(product.salePrice).toFixed(2)}</span>
                    {product.basePrice > product.salePrice && (
                      <span className="text-xl text-muted-foreground line-through">${(product.basePrice || 0).toFixed(2)}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-primary">${(product.basePrice || 0).toFixed(2)}</span>
                )}
                {/* Placeholder for rating */}
                <div className="flex items-center gap-1 text-sm">
                  <div className="flex text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current text-muted" />
                  </div>
                  <span className="text-muted-foreground">(24 reseñas)</span>
                </div>
              </div>
            </div>

            <div className="prose prose-stone dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground">
                {product.description || "Descripción no disponible para este producto premium. Experimenta calidad y rendimiento."}
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border rounded-full p-1 pr-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => q - 1)}
                  >
                    -
                  </Button>
                  <span className="font-bold w-4 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    disabled={quantity >= maxQuantity}
                    onClick={() => setQuantity(q => Math.min(q + 1, maxQuantity))}
                  >
                    +
                  </Button>
                </div>
                <Button
                  size="lg"
                  className="flex-1 h-12 text-lg rounded-full shadow-lg shadow-primary/20"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdding}
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Agregando...
                    </>
                  ) : isOutOfStock ? (
                    "Sin Stock"
                  ) : (
                    "Agregar al Carrito"
                  )}
                </Button>
              </div>
              {isLowStock && !isOutOfStock && (
                <p className="text-sm text-orange-600 font-medium">
                  ⚠️ Solo quedan {maxQuantity} unidades disponibles
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Garantía de 2 Años</p>
                  <p>Cobertura completa</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg">
                <Loader2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Envío Rápido</p>
                  <p>2-3 días hábiles</p>
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
      <Footer />
    </div>
  );
}
