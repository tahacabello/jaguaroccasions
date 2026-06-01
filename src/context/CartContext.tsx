"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  mode: "rent" | "sale"; // 'rent' for rental, 'sale' for purchasing
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string, mode: "rent" | "sale") => void;
  updateQuantity: (id: string, mode: "rent" | "sale", quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  cartTotal: number;
  cartSubtotal: number;
  discount: number;
  couponCode: string | null;
  cartCount: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);
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

  const addToCart = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (i) => i.id === item.id && i.mode === item.mode
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }

      return [...prevItems, { ...item, quantity }];
    });
  };

  const removeFromCart = (id: string, mode: "rent" | "sale") => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.mode === mode))
    );
  };

  const updateQuantity = (id: string, mode: "rent" | "sale", quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, mode);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.mode === mode ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscount(0);
    setCouponCode(null);
  };

  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const applyCoupon = (code: string) => {
    const upperCode = code.trim().toUpperCase();
    if (upperCode === "JAGUAR20") {
      setDiscount(cartSubtotal * 0.20);
      setCouponCode(upperCode);
      return { success: true, message: "تم تطبيق الخصم بنجاح (20%)" };
    } else if (upperCode === "MINUS50") {
      setDiscount(50);
      setCouponCode(upperCode);
      return { success: true, message: "تم تطبيق الخصم بنجاح (50 د.ل)" };
    }
    return { success: false, message: "كود الخصم غير صحيح أو منتهي الصلاحية" };
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCouponCode(null);
  };

  // Recalculate discount if cart changes
  useEffect(() => {
    if (couponCode === "JAGUAR20") {
      setDiscount(cartSubtotal * 0.20);
    } else if (couponCode === "MINUS50" && cartSubtotal > 50) {
      setDiscount(50);
    } else if (couponCode === "MINUS50" && cartSubtotal <= 50) {
      setDiscount(0);
      setCouponCode(null);
    }
  }, [cartSubtotal, couponCode]);

  const cartTotal = Math.max(0, cartSubtotal - discount);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        cartTotal,
        cartSubtotal,
        discount,
        couponCode,
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
