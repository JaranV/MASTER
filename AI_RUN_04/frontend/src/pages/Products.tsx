import { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../api";
import type { Product } from "../types";
import { useCart } from "../CartContext";
import { formatNok } from "../pricing";

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const { add } = useCart();

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  return (
    <section className="page">
      <div className="page-header">
        <h1>Products</h1>
        <input
          type="search"
          className="search-input"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className="error">Failed to load products: {error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p>No products match your search.</p>
      )}

      <ul className="product-grid">
        {filtered.map((p) => (
          <li key={p.id} className="product-card">
            <img
              className="product-image"
              src={p.imageUrl}
              alt={p.name}
            />
            <div className="product-info">
              <h2>{p.name}</h2>
              <p className="product-description">{p.description}</p>
              <p className="product-price">{formatNok(p.price)}</p>
              <p className="product-stock">
                {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
              </p>
              <button
                className="primary"
                disabled={p.stock === 0}
                onClick={() => add(p.id)}
              >
                Add to cart
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
