"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  cartKey: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  mode: "rent" | "sale"; // 'rent' for rental, 'sale' for purchasing
  
  // Customization fields
  customization_type?: "embroidery" | "print" | "none";
  layer_type?: "double" | "triple" | "none";
  color_sash?: string;
  color_text?: string;
  custom_text?: string; // name or custom text
  pickup_date?: string; // item-level pickup
  return_date?: string; // item-level return
  is_preliminary?: boolean; // first ready / preliminary
  is_edged?: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity" | "cartKey">, quantity?: number) => void;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("jaguar_cart");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("jaguar_cart", JSON.stringify(cartItems));
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
      }
    }
  }, [cartItems, isLoaded]);

  const addToCart = (item: Omit<CartItem, "quantity" | "cartKey">, quantity = 1) => {
    const keyParts = [
      item.id,
      item.mode,
      item.customization_type || 'none',
      item.layer_type || 'none',
      item.color_sash || 'none',
      item.color_text || 'none',
      item.custom_text || 'none',
      item.is_edged ? 'edged' : 'no_edged',
      item.pickup_date || 'none',
      item.return_date || 'none',
      item.is_preliminary ? 'prelim' : 'fixed'
    ];
    const generatedKey = keyParts.join('_');

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (i) => i.cartKey === generatedKey
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }

      return [...prevItems, { ...item, cartKey: generatedKey, quantity } as CartItem];
    });
  };

  const removeFromCart = (cartKey: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.cartKey !== cartKey)
    );
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
