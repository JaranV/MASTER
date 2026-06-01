import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api';
import { useCart } from '../cart';
import type { Product } from '../types';

export default function Cart() {
  const { entries, remove, setQuantity, subtotal, discount, totalBeforeShipping } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading cart…</p>;

  if (entries.length === 0) {
    return (
      <section className="cart-page">
        <h1>Cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/">Continue shopping</Link>
      </section>
    );
  }

  const s = subtotal(products);
  const d = discount(products);
  const t = totalBeforeShipping(products);

  return (
    <section className="cart-page">
      <h1>Cart</h1>
      <ul className="cart-list">
        {entries.map((entry) => {
          const p = products.find((pr) => pr.id === entry.productId);
          if (!p) return null;
          return (
            <li key={entry.productId} className="cart-item">
              <div className="cart-item-info">
                <strong>{p.name}</strong>
                <span>{p.price.toFixed(2)} NOK</span>
              </div>
              <div className="cart-item-qty">
                <button onClick={() => setQuantity(entry.productId, entry.quantity - 1)}>-</button>
                <input
                  type="number"
                  min={0}
                  value={entry.quantity}
                  onChange={(e) => setQuantity(entry.productId, parseInt(e.target.value, 10) || 0)}
                />
                <button
                  onClick={() => setQuantity(entry.productId, entry.quantity + 1)}
                  disabled={entry.quantity >= p.stock}
                >
                  +
                </button>
              </div>
              <div className="cart-item-total">
                {(p.price * entry.quantity).toFixed(2)} NOK
              </div>
              <button className="remove" onClick={() => remove(entry.productId)}>Remove</button>
            </li>
          );
        })}
      </ul>
      <div className="cart-summary">
        <div><span>Subtotal:</span><span>{s.toFixed(2)} NOK</span></div>
        {d > 0 && <div className="discount"><span>Discount (10%):</span><span>-{d.toFixed(2)} NOK</span></div>}
        <div className="grand"><span>Total (ex. shipping):</span><span>{t.toFixed(2)} NOK</span></div>
      </div>
      <Link to="/checkout" className="checkout-btn">Proceed to checkout</Link>
    </section>
  );
}
