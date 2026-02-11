"use client";

import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { LoginModal } from "@/components/auth/LoginModal";
import { useState } from "react";

export function CartSheet() {
  const { items, removeItem, updateQuantity, subtotal, isOpen, closeCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const total = subtotal();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-6">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="h-5 w-5" />
            Carrito de Compras
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({items.reduce((acc, item) => acc + item.quantity, 0)} artículos)
            </span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="bg-secondary/30 p-6 rounded-full">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold text-lg">Tu carrito está vacío</h3>
                <p className="text-sm text-muted-foreground">Parece que no has agregado nada aún.</p>
            </div>
            <Button onClick={closeCart} className="mt-4">
              Empezar a Comprar
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="flex flex-col gap-6 py-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 bg-secondary/20 rounded-lg overflow-hidden border">
                      {item.image ? (
                           // Use unoptimized for external images if needed or just configured domain
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                      ) : (
                          <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                              <ShoppingBag className="h-6 w-6" />
                          </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between items-start gap-2">
                         <div>
                            <h4 className="font-medium line-clamp-2 text-sm">{item.name}</h4>
                            {item.salePrice ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm font-semibold">${Number(item.salePrice).toFixed(2)}</span>
                                    <span className="text-xs text-muted-foreground line-through">${Number(item.price).toFixed(2)}</span>
                                </div>
                            ) : (
                                <p className="text-sm font-semibold mt-1">${Number(item.price).toFixed(2)}</p>
                            )}
                         </div>
                         <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive -mr-2"
                            onClick={() => removeItem(item.id)}
                          >
                            <span className="sr-only">Eliminar</span>
                            <X className="h-4 w-4" />
                          </Button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="flex items-center gap-1 border rounded-md">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-none"
                                disabled={item.quantity <= 1}
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                                <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-none"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="text-sm font-medium">
                            ${(Number(item.salePrice || item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="pt-6 border-t space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold">${Number(total).toFixed(2)}</span>
                    </div>
                     <Separator className="my-2" />
                     <div className="flex justify-between text-base font-semibold">
                        <span>Total</span>
                        <span>${Number(total).toFixed(2)}</span>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Button 
                      className="w-full text-lg h-12" 
                      size="lg" 
                      onClick={() => {
                        if (!isAuthenticated) {
                          setShowLoginModal(true);
                        } else {
                          closeCart();
                        }
                      }}
                      asChild={isAuthenticated}
                    >
                      {isAuthenticated ? (
                        <Link href="/checkout">
                          Proceder al Pago
                        </Link>
                      ) : (
                        <span>Proceder al Pago</span>
                      )}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={closeCart}>
                        Seguir Comprando
                    </Button>
                </div>
            </div>
          </>
        )}
      </SheetContent>
      
      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
        redirectPath="/checkout"
      />
    </Sheet>
  );
}
