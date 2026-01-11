import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product } from '@/components/ProductCard';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { cartApi } from '@/lib/cartApi';
import { useInventory } from '@/contexts/InventoryContext';

interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
}

type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
};

type CartAction =
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: { product: Product, quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { cartItemId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  cart: CartState;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (cartItemId: string) => boolean;
  getItemQuantity: (cartItemId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateTotals = (items: CartItem[]) => {
  return items.reduce(
    (acc, item) => ({
      totalItems: acc.totalItems + item.quantity,
      totalPrice: acc.totalPrice + item.price * item.quantity,
    }),
    { totalItems: 0, totalPrice: 0 }
  );
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART': {
      const { totalItems, totalPrice } = calculateTotals(action.payload);
      return {
        items: action.payload,
        totalItems,
        totalPrice,
      };
    }

    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const cartItemId = `${product.id}-${product.selectedColor || ''}`;
      const existingItem = state.items.find(item => item.cartItemId === cartItemId);

      let updatedItems;
      if (existingItem) {
        updatedItems = state.items.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedItems = [...state.items, { ...product, quantity, cartItemId }];
      }

      const { totalItems, totalPrice } = calculateTotals(updatedItems);
      return {
        items: updatedItems,
        totalItems,
        totalPrice,
      };
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.cartItemId !== action.payload);
      const { totalItems, totalPrice } = calculateTotals(updatedItems);
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalPrice,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { cartItemId, quantity } = action.payload;
      if (quantity < 1) return state;

      const updatedItems = state.items.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      );

      const { totalItems, totalPrice } = calculateTotals(updatedItems);
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalPrice,
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { products } = useInventory();

  // Initialize from localStorage if available
  const initializer = (initialValue: CartState): CartState => {
    try {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : initialValue;
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
      return initialValue;
    }
  };

  const [cart, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  }, initializer);

  // DB Sync Effect
  useEffect(() => {
    const syncCartWithDb = async () => {
      if (!user || products.length === 0) return;

      try {
        // 1. Fetch user's cart from DB
        const dbItems = await cartApi.getUserCart(user.uid);

        // 2. Identify local items to sync to DB (migration)
        if (cart.items.length > 0) {
          const syncPromises = cart.items.map(item =>
            cartApi.upsertCartItem({
              user_id: user.uid,
              cart_item_id: item.cartItemId,
              product_id: item.id,
              quantity: item.quantity,
              selected_color: (item as any).selectedColor
            })
          );
          await Promise.all(syncPromises);

          // Clear local storage choice: we'll keep it as a fallback but DB is source of truth now
        }

        // 3. Merge DB items with full product details from Inventory
        const mergedItems: CartItem[] = dbItems.map(dbItem => {
          const product = products.find(p => p.id === dbItem.product_id);
          if (!product) return null;

          return {
            ...product,
            cartItemId: dbItem.cart_item_id,
            quantity: dbItem.quantity,
            selectedColor: dbItem.selected_color
          } as CartItem;
        }).filter(Boolean) as CartItem[];

        dispatch({ type: 'SET_CART', payload: mergedItems });
      } catch (error) {
        console.error("Failed to sync cart with DB:", error);
      }
    };

    syncCartWithDb();
  }, [user, products.length === 0]); // Run on user login or when products are loaded

  // Save to localStorage whenever cart changes (as a temporary fallback/speed optimization)
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (product: Product, quantity = 1) => {
    const cartItemId = `${product.id}-${product.selectedColor || ''}`;
    const existingItem = cart.items.find(item => item.cartItemId === cartItemId);
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });

    // Sync to DB if logged in
    if (user) {
      try {
        await cartApi.upsertCartItem({
          user_id: user.uid,
          cart_item_id: cartItemId,
          product_id: product.id,
          quantity: newQuantity,
          selected_color: product.selectedColor
        });
      } catch (error) {
        console.error("Failed to sync add to DB:", error);
      }
    }

    // Toast notifications
    if (!user) {
      const newItemCount = cart.items.length + 1;
      if (newItemCount === 1) {
        toast({
          title: 'Added to cart',
          description: `${product.name} has been added. Sign in to save your cart across devices.`,
          duration: 4000,
        });
      } else if (newItemCount === 3) {
        toast({
          title: '✨ Save your cart!',
          description: `You have ${newItemCount} items. Sign in to save them across devices!`,
          duration: 6000,
        });
      } else {
        toast({
          title: 'Added to cart',
          description: `${product.name} has been added to your cart.`,
        });
      }
    } else {
      toast({
        title: '✅ Added to cart',
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: cartItemId });

    if (user) {
      try {
        await cartApi.removeFromCart(user.uid, cartItemId);
      } catch (error) {
        console.error("Failed to sync removal to DB:", error);
      }
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;

    const item = cart.items.find(i => i.cartItemId === cartItemId);
    if (!item) return;

    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId, quantity } });

    if (user) {
      try {
        await cartApi.upsertCartItem({
          user_id: user.uid,
          cart_item_id: cartItemId,
          product_id: item.id,
          quantity: quantity,
          selected_color: (item as any).selectedColor
        });
      } catch (error) {
        console.error("Failed to sync quantity update to DB:", error);
      }
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });

    if (user) {
      try {
        await cartApi.clearCart(user.uid);
      } catch (error) {
        console.error("Failed to sync clear to DB:", error);
      }
    }
  };

  const isInCart = (cartItemId: string) => {
    return cart.items.some(item => item.cartItemId === cartItemId);
  };

  const getItemQuantity = (cartItemId: string) => {
    const item = cart.items.find(item => item.cartItemId === cartItemId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

