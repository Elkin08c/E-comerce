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

  getCartWithItems: async (cartId: string): Promise<ShoppingCart> => {
    return apiClient<ShoppingCart>(`/shopping-carts/${cartId}/with-items`);
  },

  addItem: async (cartId: string, itemData: { productId: string; variantId?: string; comboId?: string; quantity: number }): Promise<any> => {
    return apiClient(`/shopping-carts-items/${cartId}/items`, {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  },

  updateItem: async (cartId: string, itemId: string, quantity: number): Promise<any> => {
    return apiClient(`/shopping-carts-items/${cartId}/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  },

  removeItem: async (cartId: string, itemId: string): Promise<any> => {
    return apiClient(`/shopping-carts-items/${cartId}/items/${itemId}`, {
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
  },

  validateStock: async (cartId: string): Promise<any> => {
    return apiClient(`/shopping-carts/${cartId}/validate-stock`);
  }
};

