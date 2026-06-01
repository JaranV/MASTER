import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ProductList from './components/Productlist';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderConfirmation from './components/Orderconfirmation';
import './App.css';


function App() {
    const [basket, setBasket] = useState([]);

    const putInBasket = (product) => {
        setBasket(old => {
            // check if already in basket by looking through the array
            for (let i = 0; i < old.length; i++) {
                if (old[i].product.id === product.id) {
                    // found it, make a copy with updated qty
                    const updated = [...old];
                    updated[i] = { ...updated[i], qty: updated[i].qty + 1 };
                    return updated;
                }
            }
            // not found, add new entry
            return [...old, {product, qty: 1}];
        });
    };

    const takeOut = (productId) => {
        const filtered = [];
        for (let i = 0; i < basket.length; i++) {
            if (basket[i].product.id !== productId) {
                filtered.push(basket[i]);
            }
        }
        setBasket(filtered);
    };

    const emptyBasket = () => setBasket([]);

    let itemCount = 0;
    for (let i = 0; i < basket.length; i++) {
        itemCount += basket[i].qty;
    }

    return (
        <BrowserRouter>
            <div className="wrapper">
                <div className="topbar">
                    <h1>webshop</h1>
                    <div className="links">
                        <Link to="/">Products</Link>
                        <Link to="/cart">basket ({itemCount})</Link>
                    </div>
                </div>
                <div className="content">
                    <Routes>
                        <Route path="/" element={<ProductList putInBasket={putInBasket} />} />
                        <Route path="/cart" element={<Cart basket={basket} takeOut={takeOut} emptyBasket={emptyBasket} />} />
                        <Route path="/checkout" element={<Checkout basket={basket} emptyBasket={emptyBasket} />} />
                        <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;