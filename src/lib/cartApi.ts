import { supabase } from './supabaseClient';
import { Product } from '@/components/ProductCard';

export interface DbCartItem {
    user_id: string;
    cart_item_id: string;
    product_id: string;
    quantity: number;
    selected_color?: string;
}

export const cartApi = {
    // Fetch cart for a user
    async getUserCart(userId: string) {
        const { data, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    },

    // Add or update item in cart
    async upsertCartItem(item: DbCartItem) {
        const { error } = await supabase
            .from('cart_items')
            .upsert(
                {
                    user_id: item.user_id,
                    cart_item_id: item.cart_item_id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    selected_color: item.selected_color,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'user_id,cart_item_id' }
            );

        if (error) throw error;
    },

    // Remove item from cart
    async removeFromCart(userId: string, cartItemId: string) {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId)
            .eq('cart_item_id', cartItemId);

        if (error) throw error;
    },

    // Clear entire cart for a user
    async clearCart(userId: string) {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
    }
};
