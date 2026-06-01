import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartEntry, Product } from './types';

const STORAGE_KEY = 'webshop-cart-v1';

interface CartContextValue {
  entries: CartEntry[];
  add: (productId: number, quantity?: number) => void;
  remove: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
  itemCount: number;
  subtotal: (products: Product[]) => number;
  discount: (products: Product[]) => number;
  totalBeforeShipping: (products: Product[]) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<CartEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartEntry[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const value = useMemo<CartContextValue>(() => {
    const add = (productId: number, quantity = 1) =>
      setEntries((curr) => {
        const existing = curr.find((e) => e.productId === productId);
        if (existing) {
          return curr.map((e) =>
            e.productId === productId ? { ...e, quantity: e.quantity + quantity } : e,
          );
        }
        return [...curr, { productId, quantity }];
      });

    const remove = (productId: number) =>
      setEntries((curr) => curr.filter((e) => e.productId !== productId));

    const setQuantity = (productId: number, quantity: number) =>
      setEntries((curr) => {
        if (quantity <= 0) return curr.filter((e) => e.productId !== productId);
        return curr.map((e) => (e.productId === productId ? { ...e, quantity } : e));
      });

    const clear = () => setEntries([]);

    const subtotal = (products: Product[]) =>
      entries.reduce((sum, entry) => {
        const p = products.find((pr) => pr.id === entry.productId);
        return p ? sum + p.price * entry.quantity : sum;
      }, 0);

    const discount = (products: Product[]) => {
      const s = subtotal(products);
      return s > 500 ? round2(s * 0.1) : 0;
    };

    const totalBeforeShipping = (products: Product[]) =>
      round2(subtotal(products) - discount(products));

    const itemCount = entries.reduce((s, e) => s + e.quantity, 0);

    return { entries, add, remove, setQuantity, clear, itemCount, subtotal, discount, totalBeforeShipping };
  }, [entries]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
