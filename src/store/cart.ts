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
  syncLocalCartToServer: () => Promise<void>;
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
        const state = get();
        // Solo sincronizar con el servidor si hay un cartId guardado
        // (lo que significa que el usuario ya hizo login previamente)
        if (state.cartId) {
          try {
            const cart = await cartService.getOrCreateCart();
            const mappedItems = cart.items.map((item: any) => ({
              id: item.productId,
              serverItemId: item.id,
              name: item.productName,
              price: item.unitPrice,
              quantity: item.quantity,
            }));
            set({ items: mappedItems, cartId: cart.id });
          } catch (error) {
            console.log('Using local cart (server sync failed)');
          }
        }
        // Si no hay cartId, usar carrito local (ya está en el estado de Zustand)
      },

      syncLocalCartToServer: async () => {
        const state = get();
        
        // Si no hay items locales, no hay nada que sincronizar
        if (state.items.length === 0) {
          return;
        }

        try {
          // Crear o obtener carrito del servidor
          const cart = await cartService.getOrCreateCart();
          set({ cartId: cart.id });

          // Agregar todos los items locales al carrito del servidor
          for (const item of state.items) {
            try {
              await cartService.addItem(cart.id, {
                productId: item.id,
                quantity: item.quantity,
              });
            } catch (error) {
              console.log(`Failed to sync item ${item.id}:`, error);
            }
          }

          // Recargar el carrito desde el servidor para obtener los IDs correctos
          await get().fetchCart();
          
          console.log('Local cart synced to server successfully');
        } catch (error) {
          console.error('Failed to sync local cart to server:', error);
        }
      },

      addItem: async (newItem) => {
        const state = get();
        const existingItem = state.items.find((item) => item.id === newItem.id);

        if (existingItem) {
          // Si ya existe, aumentar cantidad localmente
          set((state) => ({
            items: state.items.map((item) =>
              item.id === newItem.id
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            ),
          }));
        } else {
          // Agregar nuevo item localmente
          set((state) => ({
            items: [...state.items, newItem],
          }));
        }

        // Intentar sincronizar con servidor solo si hay cartId
        if (state.cartId) {
          try {
            await cartService.addItem(state.cartId, {
              productId: newItem.id,
              quantity: newItem.quantity,
            });
          } catch (error) {
            console.log('Item added locally (server sync skipped)');
          }
        }
      },

      removeItem: async (id) => {
        const state = get();
        const item = state.items.find((item) => item.id === id);
        
        // Remover localmente
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));

        // Intentar sincronizar con servidor solo si hay cartId y serverItemId
        if (state.cartId && item?.serverItemId) {
          try {
            await cartService.removeItem(state.cartId, item.serverItemId);
          } catch (error) {
            console.log('Item removed locally (server sync skipped)');
          }
        }
      },

      updateQuantity: async (id, quantity) => {
        const state = get();
        const item = state.items.find((item) => item.id === id);

        if (quantity <= 0) {
          return get().removeItem(id);
        }

        // Actualizar localmente
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));

        // Intentar sincronizar con servidor solo si hay cartId y serverItemId
        if (state.cartId && item?.serverItemId) {
          try {
            await cartService.updateItem(state.cartId, item.serverItemId, quantity);
          } catch (error) {
            console.log('Quantity updated locally (server sync skipped)');
          }
        }
      },

      clearCart: async () => {
        const state = get();
        
        // Limpiar localmente
        set({ items: [], cartId: null });

        // Intentar limpiar en servidor solo si hay cartId
        if (state.cartId) {
          try {
            await cartService.clearCart(state.cartId);
          } catch (error) {
            console.log('Cart cleared locally (server sync skipped)');
          }
        }
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      subtotal: () => {
        return get().items.reduce((acc, item) => {
          const price = item.salePrice || item.price;
          return acc + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage), // Persistir en localStorage
    }
  )
);
