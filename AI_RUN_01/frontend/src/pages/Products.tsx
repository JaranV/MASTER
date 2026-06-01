import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '../api';
import { useCart } from '../cart';
import type { Product } from '../types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const { add } = useCart();

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  if (loading) return <p>Loading products…</p>;
  if (error) return <p className="error">Failed to load products: {error}</p>;

  return (
    <section className="products-page">
      <h1>Products</h1>
      <input
        className="search"
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="product-grid">
        {filtered.map((p) => (
          <article key={p.id} className="product-card">
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} onError={(e) => ((e.currentTarget.style.visibility = 'hidden'))} />
            ) : null}
            <h2>{p.name}</h2>
            <p className="desc">{p.description}</p>
            <p className="price">{p.price.toFixed(2)} NOK</p>
            <p className="stock">{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</p>
            <button disabled={p.stock === 0} onClick={() => add(p.id)}>
              Add to cart
            </button>
          </article>
        ))}
        {filtered.length === 0 && <p>No products match your search.</p>}
      </div>
    </section>
  );
}
