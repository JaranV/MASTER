import type { CartItem, Product } from './types';
const K = 'ws_cart';
export const load = (): CartItem[] => { try { return JSON.parse(localStorage.getItem(K) ?? '[]'); } catch { return []; } };
const save = (c: CartItem[]) => localStorage.setItem(K, JSON.stringify(c));
export function add(p: Product) { const c = load(); const e = c.find(i => i.product.id === p.id); e ? e.quantity++ : c.push({product: p, quantity: 1}); save(c); }
export function remove(id: number) { save(load().filter(i => i.product.id !== id)); }
export function setQty(id: number, q: number) { if (q < 1) { remove(id); return; } const c = load(); const e = c.find(i => i.product.id === id); if (e) { e.quantity = q; save(c); } }
export const clear = () => localStorage.removeItem(K);
export const total = (c: CartItem[]) => c.reduce((s, i) => s + i.product.price * i.quantity, 0);
export const discount = (t: number) => t > 500 ? t * 0.1 : 0;
