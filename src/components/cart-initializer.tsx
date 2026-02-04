"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

export function CartInitializer({ children }: { children: React.ReactNode }) {
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    // Intentar cargar el carrito del servidor si hay sesión
    // Si no hay sesión, usará el carrito local de Zustand
    fetchCart();
  }, [fetchCart]);

  return <>{children}</>;
}
