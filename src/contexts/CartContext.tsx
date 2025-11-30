import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Product } from '@/components/ProductCard';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';

interface CartItem extends Product {
  quantity: number;
}

type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  cart: CartState;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                // Update color if a new one is provided
                ...(action.payload as any).selectedColor && { selectedColor: (action.payload as any).selectedColor }
              }
            : item
        );
        
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + action.payload.price,
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
        totalItems: state.totalItems + 1,
        totalPrice: state.totalPrice + action.payload.price,
      };
    }
    
    case 'REMOVE_ITEM': {
      const itemToRemove = state.items.find(item => item.id === action.payload);
      if (!itemToRemove) return state;
      
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        totalItems: state.totalItems - itemToRemove.quantity,
        totalPrice: state.totalPrice - (itemToRemove.price * itemToRemove.quantity),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity < 1) return state;
      
      const itemToUpdate = state.items.find(item => item.id === id);
      if (!itemToUpdate) return state;
      
      const quantityDiff = quantity - itemToUpdate.quantity;
      
      const updatedItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
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

  const addToCart = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
    
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

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (productId: string) => {
    return cart.items.some(item => item.id === productId);
  };

  const getItemQuantity = (productId: string) => {
    const item = cart.items.find(item => item.id === productId);
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
