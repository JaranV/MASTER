import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CartProvider } from './CartContext'
import { Navigation } from './components/Navigation'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { ProductsPage } from './pages/ProductsPage'
import './App.css'

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navigation />
        <main className="page">
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation/:orderId" element={<ConfirmationPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
