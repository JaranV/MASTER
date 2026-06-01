import React from "react";
import { useNavigate } from "react-router-dom";

function Cart({ cart, removeFromCart }) {
    const navigate = useNavigate();

    const total = cart.reduce(
        (sum, item) => sum + item.product.price * item.count, 0
    );

    if (cart.length === 0) {
        return <p className="empty-message">Your cart is empty.</p>;
    }

    return (
        <div>
            <h2>Shopping Cart</h2>
            {cart.map(item => (
                <div key={item.product.id} className="cart-item">
                    <div>
                        <strong>{item.product.name}</strong>
                        <div>{item.count} x {item.product.price} kr</div>
                    </div>
                    <button className="btn-remove" onClick={() => removeFromCart(item.product.id)}>Remove</button>
                </div>
            ))}
            <div className="cart-total">
                <strong>Total: {total.toFixed(2)} kr</strong>
            </div>
            <button onClick={() => navigate('/checkout')}>Proceed to checkout</button>
        </div>
    );
}

export default Cart;
