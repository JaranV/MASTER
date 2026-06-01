import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../api";
import { computeDiscount, useCart } from "../cart";
import type { Product } from "../types";

export function CartPage() {
  const { items, setQuantity, removeItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e: Error) => setError(e.message));
  }, []);

  const lines = useMemo(() => {
    return items
      .map((i) => {
        const product = products.find((p) => p.id === i.productId);
        return product ? { product, quantity: i.quantity } : null;
      })
      .filter((x): x is { product: Product; quantity: number } => x !== null);
  }, [items, products]);

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.product.price * l.quantity, 0),
    [lines],
  );
  const discount = computeDiscount(subtotal);

  return (
    <div className="page">
      <h1>Your cart</h1>
      {error && <p className="error">{error}</p>}
      {lines.length === 0 ? (
        <p>
          Your cart is empty. <Link to="/">Browse products</Link>.
        </p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lines.map(({ product, quantity }) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.price.toFixed(2)} NOK</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      max={product.stock}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(product.id, Number(e.target.value))
                      }
                    />
                  </td>
                  <td>{(product.price * quantity).toFixed(2)} NOK</td>
                  <td>
                    <button onClick={() => removeItem(product.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="summary">
            <div>
              <span>Subtotal:</span>
              <span>{subtotal.toFixed(2)} NOK</span>
            </div>
            {discount > 0 && (
              <div className="discount">
                <span>Discount (10%):</span>
                <span>-{discount.toFixed(2)} NOK</span>
              </div>
            )}
            <div className="total">
              <span>Total (before shipping):</span>
              <span>{(subtotal - discount).toFixed(2)} NOK</span>
            </div>
            <Link to="/checkout" className="primary">
              Proceed to checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
