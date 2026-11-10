"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type CartItem = { id: string; name: string; price: number; qty: number; maxStock: number; image: string };

type CartContextType = {
  cart: Record<string, CartItem>;
  addToCart: (item: { id: string; name: string; price: number; maxStock: number; image: string }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rms_cart");
      if (raw) setCart(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("rms_cart", JSON.stringify(cart)); } catch {}
  }, [cart]);

  function addToCart(item: { id: string; name: string; price: number; maxStock: number; image: string }) {
    setCart((prev) => {
      const c = prev[item.id] || { id: item.id, name: item.name, price: item.price, qty: 0, maxStock: item.maxStock, image: item.image };
      if (c.qty >= item.maxStock) return prev;
      return { ...prev, [item.id]: { ...c, qty: c.qty + 1 } };
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }

  function updateQuantity(id: string, qty: number) {
    setCart((prev) => {
      if (qty <= 0) { const n = { ...prev }; delete n[id]; return n; }
      const c = prev[id]; if (!c) return prev;
      const q = Math.min(qty, c.maxStock);
      return { ...prev, [id]: { ...c, qty: q } };
    });
  }

  function clearCart() { setCart({}); }

  const total = Object.values(cart).reduce((s, c) => s + c.price * c.qty, 0);
  const itemCount = Object.values(cart).reduce((s, c) => s + c.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}