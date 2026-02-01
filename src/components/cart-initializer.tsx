"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

export function CartInitializer({ children }: { children: React.ReactNode }) {
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return <>{children}</>;
}
