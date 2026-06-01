import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../api";
import type { Product } from "../types";
import { useCart } from "../CartContext";
import { computeDiscount, formatNok } from "../pricing";

type ResolvedItem = {
  product: Product;
  quantity: number;
};

export function Cart() {
  const { items, remove, setQuantity } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((data) => {
        if (!active) return;
        setProducts(data);
        setLoading(false);
      })
      .catch((e: Error) => {
        if (!active) return;
        setError(e.message);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const resolved: ResolvedItem[] = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return items
      .map((it) => {
        const product = map.get(it.productId);
        return product ? { product, quantity: it.quantity } : null;
      })
      .filter((it): it is ResolvedItem => it !== null);
  }, [items, products]);

  const subtotal = resolved.reduce(
    (sum, it) => sum + it.product.price * it.quantity,
    0,
  );
  const discount = computeDiscount(subtotal);

  if (loading) {
    return (
      <section className="page">
        <h1>Cart</h1>
        <p>Loading cart...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <h1>Cart</h1>
        <p className="error">Failed to load cart: {error}</p>
      </section>
    );
  }

  if (resolved.length === 0) {
    return (
      <section className="page">
        <h1>Cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/" className="primary-link">
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>Cart</h1>
      <ul className="cart-list">
        {resolved.map((it) => (
          <li key={it.product.id} className="cart-row">
            <img
              className="cart-image"
              src={it.product.imageUrl}
              alt={it.product.name}
            />
            <div className="cart-main">
              <h2>{it.product.name}</h2>
              <p>{formatNok(it.product.price)} each</p>
            </div>
            <div className="cart-qty">
              <label>
                Qty
                <input
                  type="number"
                  min={1}
                  max={it.product.stock}
                  value={it.quantity}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v) && v >= 1) {
                      setQuantity(it.product.id, Math.min(v, it.product.stock));
                    }
                  }}
                />
              </label>
            </div>
            <div className="cart-line-total">
              {formatNok(it.product.price * it.quantity)}
            </div>
            <button
              className="secondary"
              onClick={() => remove(it.product.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="totals">
        <div>
          <span>Subtotal</span>
          <span>{formatNok(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="discount">
            <span>Discount (10%)</span>
            <span>-{formatNok(discount)}</span>
          </div>
        )}
        <div className="grand">
          <span>Total (before shipping)</span>
          <span>{formatNok(subtotal - discount)}</span>
        </div>
      </div>

      <div className="actions">
        <Link to="/" className="secondary-link">
          Continue shopping
        </Link>
        <Link to="/checkout" className="primary-link">
          Checkout
        </Link>
      </div>
    </section>
  );
}
