import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cartService } from '@/lib/services/cart.service';

export interface CartItem {
  id: string; // This will be the product ID or variant ID locally, but we need to map to server item IDs
  serverItemId?: string; 
  name: string;
  price: number;
  salePrice?: number;
  image?: string;
  quantity: number;
  slug?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  cartId: string | null;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      cartId: null,
      
      fetchCart: async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        try {
          const cart = await cartService.getOrCreateCart();
          const mappedItems = cart.items.map((item: any) => ({
            id: item.productId,
            serverItemId: item.id,
            name: item.productName,
            price: item.unitPrice,
            quantity: item.quantity,
            // image: item.product?.images?.[0]?.url // Assumes expansion if needed
          }));
          set({ items: mappedItems, cartId: cart.id });
        } catch (error) {
          console.error("Error fetching cart from server:", error);
        }
      },

      addItem: async (newItem) => {
        const token = localStorage.getItem("token");
        const state = get();
        const existingItem = state.items.find((item) => item.id === newItem.id);

        if (token) {
          try {
            let cartId = state.cartId;
            if (!cartId) {
              const cart = await cartService.getOrCreateCart();
              cartId = cart.id;
              set({ cartId });
            }

            if (existingItem && existingItem.serverItemId) {
              await cartService.updateItem(existingItem.serverItemId, existingItem.quantity + 1);
            } else {
              const res = await cartService.addItem(cartId, {
                productId: newItem.id,
                quantity: 1,
              });
              newItem.serverItemId = res.id;
            }
          } catch (error) {
            console.error("Error adding item to server cart:", error);
          }
        }

        set((state) => {
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { ...newItem, quantity: 1 }], isOpen: true };
        });
      },

      removeItem: async (id) => {
        const token = localStorage.getItem("token");
        const state = get();
        const itemToRemove = state.items.find(item => item.id === id);

        if (token && itemToRemove?.serverItemId) {
          try {
            await cartService.removeItem(itemToRemove.serverItemId);
          } catch (error) {
            console.error("Error removing item from server cart:", error);
          }
        }

        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: async (id, quantity) => {
        const token = localStorage.getItem("token");
        const state = get();
        const itemToUpdate = state.items.find(item => item.id === id);
        const newQuantity = Math.max(1, quantity);

        if (token && itemToUpdate?.serverItemId) {
          try {
            await cartService.updateItem(itemToUpdate.serverItemId, newQuantity);
          } catch (error) {
            console.error("Error updating item quantity on server:", error);
          }
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: newQuantity } : item
          ),
        }));
      },

      clearCart: async () => {
        const token = localStorage.getItem("token");
        const state = get();
        if (token && state.cartId) {
          try {
            await cartService.clearCart(state.cartId);
          } catch (error) {
            console.error("Error clearing server cart:", error);
          }
        }
        set({ items: [] });
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      subtotal: () => {
         return get().items.reduce((acc, item) => {
             const price = item.salePrice ? item.salePrice : item.price;
             return acc + price * item.quantity;
         }, 0);
      }
    }),
    {
      name: 'shopping-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
