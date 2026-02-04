"use client";

import { useState } from "react";
import { ShoppingCart, Plus } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  productId?: string;
  variantId?: string;
  comboId?: string;
  productName: string;
  price: number;
  salePrice?: number;
  quantity?: number;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
}

export function AddToCartButton({
  productId,
  variantId,
  comboId,
  productName,
  price,
  salePrice,
  quantity = 1,
  variant = "default",
  size = "default",
  className,
  showIcon = true,
}: AddToCartButtonProps) {
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!productId && !variantId && !comboId) {
      console.error("Se requiere productId, variantId o comboId");
      return;
    }

    setIsAdding(true);
    try {
      await addItem({
        id: productId || variantId || comboId || "",
        name: productName,
        price,
        salePrice,
        quantity,
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={isAdding}
    >
      {isAdding ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          Agregando...
        </>
      ) : (
        <>
          {showIcon && (size === "icon" ? <Plus className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4 mr-2" />)}
          {size !== "icon" && "Agregar al Carrito"}
        </>
      )}
    </Button>
  );
}
