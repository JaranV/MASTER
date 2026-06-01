import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderConfirmation from './components/OrderConfirmation';
import './App.css';

function App() {
    const [cart, setCart] = useState([]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, count: item.count + 1 }
                        : item
                );
            }
            return [...prev, { product, count: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const clearCart = () => setCart([]);

    return (
        <BrowserRouter>
            <div className="app">
                <header>
                    <h1>Webshop</h1>
                    <nav>
                        <Link to="/">Products</Link>
                        <Link to="/cart">Cart ({cart.reduce((sum, item) => sum + item.count, 0)})</Link>
                    </nav>
                </header>
                <main>
                    <Routes>
                        <Route path="/" element={<ProductList addToCart={addToCart} />} />
                        <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} />} />
                        <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
                        <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
