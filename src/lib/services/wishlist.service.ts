import { client } from "@/lib/apollo";
import { GET_WISHLIST } from "@/graphql/queries";
import { CREATE_WISHLIST, REMOVE_WISHLIST } from "@/graphql/mutations";

export interface WishlistItem {
    id: string;
    userId: string;
    productId?: string;
    variantId?: string;
    priority: number;
    notes?: string;
}

export const wishlistService = {
    getWishlist: async (): Promise<WishlistItem[]> => {
        try {
            const { data } = await client.query<any>({
                query: GET_WISHLIST,
                variables: { first: 100 },
                fetchPolicy: "network-only",
            });
            return data.wishlists.edges.map((edge: any) => edge.node);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            throw error;
        }
    },

    addItem: async (input: { userId: string; productId?: string; variantId?: string; priority?: number }) => {
        try {
            const { data } = await client.mutate<any>({
                mutation: CREATE_WISHLIST,
                variables: {
                    createWishlistInput: {
                        priority: 1, // Default priority
                        notifyOnPriceChange: false,
                        notifyOnStock: false,
                        ...input,
                    },
                },
            });
            return data.createWishlist;
        } catch (error) {
            console.error("Error adding to wishlist:", error);
            throw error;
        }
    },

    removeItem: async (id: string) => {
        try {
            const { data } = await client.mutate<any>({
                mutation: REMOVE_WISHLIST,
                variables: { id },
            });
            return data.removeWishlist;
        } catch (error) {
            console.error("Error removing from wishlist:", error);
            throw error;
        }
    },
};
