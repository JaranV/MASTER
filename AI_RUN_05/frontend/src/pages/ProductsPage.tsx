import { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../api";
import { useCart } from "../cart";
import type { Product } from "../types";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  return (
    <div className="page">
      <h1>Products</h1>
      <input
        className="search"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading && <p>Loading products...</p>}
      {error && <p className="error">{error}</p>}
      <div className="product-grid">
        {filtered.map((p) => (
          <article key={p.id} className="product-card">
            <div className="product-image">
              <img src={p.imageUrl} alt={p.name} onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }} />
            </div>
            <h2>{p.name}</h2>
            <p className="desc">{p.description}</p>
            <p className="price">{p.price.toFixed(2)} NOK</p>
            <p className="stock">
              {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
            </p>
            <button
              disabled={p.stock <= 0}
              onClick={() => addItem(p)}
              className="primary"
            >
              Add to cart
            </button>
          </article>
        ))}
        {!loading && filtered.length === 0 && <p>No products match.</p>}
      </div>
    </div>
  );
}
