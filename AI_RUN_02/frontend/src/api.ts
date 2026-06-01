const B = 'http://localhost:8080/api';

export const fetchProducts = () => fetch(`${B}/products`).then(r => r.json());

export async function createOrder(body: object) {
  const r = await fetch(`${B}/orders`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error ?? 'Order failed');
  return d;
}

export async function payOrder(id: number) {
  const r = await fetch(`${B}/orders/${id}/pay`, { method:'POST' });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error ?? 'Payment failed');
  return d;
}

export const fetchOrder = (id: string) => fetch(`${B}/orders/${id}`).then(r => r.json());
