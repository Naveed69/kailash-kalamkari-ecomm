import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Product } from '@/components/ProductCard';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';

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

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const cartItemId = `${product.id}-${product.selectedColor || ''}`;
      const existingItem = state.items.find(item => item.cartItemId === cartItemId);

      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + quantity,
          totalPrice: state.totalPrice + (product.price * quantity),
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...product, quantity, cartItemId }],
        totalItems: state.totalItems + quantity,
        totalPrice: state.totalPrice + (product.price * quantity),
      };
    }
    
    case 'REMOVE_ITEM': {
      const itemToRemove = state.items.find(item => item.cartItemId === action.payload);
      if (!itemToRemove) return state;
      
      return {
        ...state,
        items: state.items.filter(item => item.cartItemId !== action.payload),
        totalItems: state.totalItems - itemToRemove.quantity,
        totalPrice: state.totalPrice - (itemToRemove.price * itemToRemove.quantity),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { cartItemId, quantity } = action.payload;
      if (quantity < 1) return state;
      
      const itemToUpdate = state.items.find(item => item.cartItemId === cartItemId);
      if (!itemToUpdate) return state;
      
      const quantityDiff = quantity - itemToUpdate.quantity;
      
      const updatedItems = state.items.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      );
      
      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems + quantityDiff,
        totalPrice: state.totalPrice + (itemToUpdate.price * quantityDiff),
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

  // Save to localStorage whenever cart changes
  React.useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const addToCart = (product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
    
    // Smart login prompts based on user state
    if (!user) {
      const newItemCount = cart.items.length + 1;
      
      // First time adding to cart - gentle suggestion
      if (newItemCount === 1) {
        toast({
          title: 'Added to cart',
          description: `${product.name} has been added. Sign in to save your cart across devices.`,
          duration: 4000,
        });
      }
      // After 3 items - stronger suggestion
      else if (newItemCount === 3) {
        toast({
          title: '✨ Save your cart!',
          description: `You have ${newItemCount} items. Sign in to save them across devices!`,
          duration: 6000,
        });
      }
      // Regular add notification
      else {
        toast({
          title: 'Added to cart',
          description: `${product.name} has been added to your cart.`,
        });
      }
    } else {
      // User is logged in - normal toast
      toast({
        title: '✅ Added to cart',
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const removeFromCart = (cartItemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: cartItemId });
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
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

