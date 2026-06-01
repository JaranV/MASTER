import { useEffect, useState } from 'react'
import type { Product } from '../types.ts'
import ProductCard from '../components/ProductCard.tsx'

const API = import.meta.env.VITE_API_URL

function Home({ addToCart }: { addToCart: (p: Product) => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then(r => r.json())
      .then(data => setProducts(data))
  }, [])

  let filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (sort === 'price-asc') {
    filtered = [...filtered].sort((a, b) => a.price - b.price)
  } else if (sort === 'price-desc') {
    filtered = [...filtered].sort((a, b) => b.price - a.price)
  } else if (sort === 'name') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === 'low-stock') {
    filtered = [...filtered].sort((a, b) => a.stock - b.stock)
  }

  if (products.length === 0) {
    return <p className="empty-msg">Loading products...</p>
  }

  return (
    <div className="home">
      <aside className="sidebar">
        <h3>Sort by</h3>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="default">Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A-Z</option>
          <option value="low-stock">Low Stock First</option>
        </select>
      </aside>

      <div className="main-area">
        <input
          className="search-bar"
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {filtered.length === 0 ? (
          <p className="empty-msg">No products found.</p>
        ) : (
          <div className="product-grid">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onAdd={() => addToCart(p)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
