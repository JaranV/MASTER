import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import type { CartEntry, Product } from './types.ts'
import Home from './routes/Home.tsx'
import Cart from './routes/Cart.tsx'
import Checkout from './routes/Checkout.tsx'
import Success from './routes/Success.tsx'
import Failure from './routes/Failure.tsx'
import './App.css'

function App() {
  const [cart, setCart] = useState<CartEntry[]>([])

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(e => e.product.id === product.id)
      if (existing) {
        return prev.map(e =>
          e.product.id === product.id ? { ...e, count: e.count + 1 } : e
        )
      }
      return [...prev, { product, count: 1 }]
    })
  }

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(e => e.product.id !== productId))
  }

  const clearCart = () => setCart([])

  const cartCount = cart.reduce((sum, e) => sum + e.count, 0)

  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/" className="logo">Webshop</Link>
        <div className="nav-links">
          <Link to="/">Products</Link>
          <Link to="/cart">Cart ({cartCount})</Link>
        </div>
      </nav>
      <main className="content">
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} />} />
          <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
          <Route path="/success" element={<Success />} />
          <Route path="/failure" element={<Failure />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
