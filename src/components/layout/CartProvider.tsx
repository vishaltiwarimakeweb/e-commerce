"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface CartContextValue {
  itemCount: number;
  setItemCount: (count: number) => void;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ initialCount, children }: { initialCount: number; children: ReactNode }) {
  const [itemCount, setItemCount] = useState(initialCount);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/cart", { cache: "no-store" });
    if (!res.ok) {
      setItemCount(0);
      return;
    }
    const data = await res.json();
    setItemCount(data.cart.itemCount);
  }, []);

  return <CartContext.Provider value={{ itemCount, setItemCount, refresh }}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
