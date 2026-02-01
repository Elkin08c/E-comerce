import { apiClient } from "../api-client";

export interface ShoppingCart {
  id: string;
  customerId: string;
  items: any[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
}

export const cartService = {
  getOrCreateCart: async (): Promise<ShoppingCart> => {
    return apiClient<ShoppingCart>("/shopping-carts/my-active-cart");
  },

  addItem: async (cartId: string, itemData: { productId: string; variantId?: string; quantity: number }): Promise<any> => {
    return apiClient(`/shopping-carts-items`, {
      method: "POST",
      body: JSON.stringify({
        shoppingCartId: cartId,
        ...itemData
      }),
    });
  },

  updateItem: async (itemId: string, quantity: number): Promise<any> => {
    return apiClient(`/shopping-carts-items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  },

  removeItem: async (itemId: string): Promise<any> => {
    return apiClient(`/shopping-carts-items/${itemId}`, {
      method: "DELETE",
    });
  },

  clearCart: async (cartId: string): Promise<any> => {
    return apiClient(`/shopping-carts/${cartId}/clear`, {
      method: "POST",
    });
  },

  getCartTotals: async (cartId: string): Promise<any> => {
    return apiClient(`/shopping-carts/${cartId}/totals`);
  }
};
