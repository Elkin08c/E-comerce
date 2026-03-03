import { create } from 'zustand';
import { wishlistService, WishlistItem } from '@/lib/services/wishlist.service';
import { useAuthStore } from '@/store/auth';

interface WishlistStore {
    items: WishlistItem[];
    isLoading: boolean;
    error: string | null;
    fetchWishlist: () => Promise<void>;
    addItem: (productId: string) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
    items: [],
    isLoading: false,
    error: null,

    fetchWishlist: async () => {
        const { isAuthenticated, user } = useAuthStore.getState();
        if (!isAuthenticated || !user) {
            set({ items: [] });
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const allItems = await wishlistService.getWishlist();
            // Filter by user ID if necessary, though service should handle it ideally.
            // Given the previous concern, I'll filter here just in case.
            const userItems = allItems.filter(item => item.userId === user.id);
            set({ items: userItems, isLoading: false });
        } catch (error) {
            console.error("Error fetching wishlist in store:", error);
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addItem: async (productId: string) => {
        const { isAuthenticated, user } = useAuthStore.getState();
        if (!isAuthenticated || !user) throw new Error("Debes iniciar sesión para agregar a favoritos");

        const existing = get().items.find(item => item.productId === productId);
        if (existing) return; // Already in wishlist

        set({ isLoading: true, error: null });
        // Optimistic update
        const tempId = "temp-" + Date.now();
        const newItem: WishlistItem = {
            id: tempId,
            userId: user.id,
            productId,
            priority: 1
        };

        set(state => ({ items: [...state.items, newItem] }));

        try {
            const created = await wishlistService.addItem({ userId: user.id, productId });

            // Replace temp item with real one
            set(state => ({
                items: state.items.map(i => i.id === tempId ? created : i),
                isLoading: false
            }));
        } catch (error) {
            set(state => ({
                items: state.items.filter(i => i.id !== tempId), // Revert
                error: (error as Error).message,
                isLoading: false
            }));
            throw error;
        }
    },

    removeItem: async (productId: string) => {
        const { items } = get();
        const item = items.find(i => i.productId === productId);
        if (!item) return;

        set({ isLoading: true, error: null });
        // Optimistic remove
        set(state => ({ items: state.items.filter(i => i.productId !== productId) }));

        try {
            await wishlistService.removeItem(item.id);
            set({ isLoading: false });
        } catch (error) {
            // Revert
            set(state => ({ items: [...state.items, item], error: (error as Error).message, isLoading: false }));
            throw error;
        }
    },

    isInWishlist: (productId: string) => {
        return get().items.some(item => item.productId === productId);
    }
}));
