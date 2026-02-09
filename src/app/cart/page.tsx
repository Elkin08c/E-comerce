"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCartStore();

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string, itemName: string) => {
    await removeItem(itemId);
    toast.success(`${itemName} eliminado del carrito`);
  };

  const handleClearCart = async () => {
    if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
      await clearCart();
      toast.success("Carrito vaciado");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
          <Card className="text-center py-16">
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <ShoppingCart className="h-24 w-24 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Tu carrito está vacío</h2>
                <p className="text-muted-foreground">
                  Agrega productos para comenzar tu compra
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/catalog">
                  Explorar Productos
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Carrito de Compras</h1>
          <Button variant="ghost" size="sm" onClick={handleClearCart}>
            Vaciar Carrito
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = item.salePrice || item.price;
              const hasDiscount = item.salePrice && item.salePrice < item.price;

              return (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="w-24 h-24 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              href={`/product/${item.id}`}
                              className="font-semibold text-lg hover:text-primary transition-colors"
                            >
                              {item.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              {hasDiscount ? (
                                <>
                                  <span className="text-xl font-bold text-destructive">
                                    ${price.toFixed(2)}
                                  </span>
                                  <span className="text-sm text-muted-foreground line-through">
                                    ${item.price.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xl font-bold">
                                  ${price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id, item.name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Subtotal: ${(price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Productos ({items.reduce((sum, item) => sum + item.quantity, 0)})
                    </span>
                    <span>${subtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="text-sm">Calculado en checkout</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${subtotal().toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  className="w-full h-12 text-lg"
                  size="lg"
                  onClick={() => router.push("/checkout")}
                >
                  Proceder al Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href="/catalog">
                    Continuar Comprando
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
