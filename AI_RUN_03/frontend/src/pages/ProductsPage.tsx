import { useEffect, useMemo, useState } from 'react'
import { fetchProducts } from '../api'
import { useCart } from '../CartContext'
import { formatNok } from '../pricing'
import type { Product } from '../types'

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { items: cartItems, addItem } = useCart()

  useEffect(() => {
    fetchProducts()
      .then((p) => setProducts(p))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, search])

  if (loading) return <p>Loading products…</p>
  if (error) return <p className="error">Error: {error}</p>

  return (
    <section>
      <h1>Products</h1>
      <input
        className="search"
        type="search"
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="product-grid">
        {filtered.map((p) => {
          const inCart = cartItems.find((i) => i.productId === p.id)?.quantity ?? 0
          const atLimit = inCart >= p.stock
          return (
            <article key={p.id} className="product-card">
              <img src={p.imageUrl} alt={p.name} />
              <h2>{p.name}</h2>
              <p className="desc">{p.description}</p>
              <p className="price">{formatNok(p.price)}</p>
              <p className="stock">{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</p>
              <button
                type="button"
                disabled={p.stock <= 0 || atLimit}
                onClick={() => addItem(p.id, 1)}
              >
                {atLimit ? 'Max in cart' : 'Add to cart'}
              </button>
            </article>
          )
        })}
        {filtered.length === 0 && <p>No products match your search.</p>}
      </div>
    </section>
  )
}
