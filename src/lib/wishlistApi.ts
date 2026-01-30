import { supabase } from './supabaseClient';
import { Product } from '@/components/ProductCard';

export const wishlistApi = {
  // Fetch wishlist for a user
  async getUserWishlist(userId: string) {
    const { data, error } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(item => item.product_id);
  },

  // Add item to wishlist
  async addToWishlist(userId: string, productId: string) {
    const { error } = await supabase
      .from('wishlists')
      .insert({ user_id: userId, product_id: productId });

    if (error) {
      // Ignore duplicate key error (already in wishlist)
      if (error.code === '23505') return;
      throw error;
    }
  },

  // Remove item from wishlist
  async removeFromWishlist(userId: string, productId: string) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  }
};
