import React from "react";
import { useNavigate } from 'react-router-dom';

function Cart({basket, takeOut}) {

    const navigate = useNavigate();

    if (basket.length === 0) {
        return <p>basket is empty</p>
    }

    let totalPrice = 0;
    for (let i = 0; i < basket.length; i++) {
        totalPrice += basket[i].product.price * basket[i].qty;
    }

    return (
        <div>
            <h2>Your basket</h2>
            <table className="basket-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {basket.map(entry => (
                        <tr key={entry.product.id}>
                            <td>{entry.product.name}</td>
                            <td>{entry.qty}</td>
                            <td>{entry.product.price * entry.qty} kr</td>
                            <td><button className="remove-btn" onClick={() => takeOut(entry.product.id)}>X</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="basket-sum"><strong>Sum: {totalPrice.toFixed(2)} kr</strong></p>
            <button onClick={() => navigate('/checkout')}>go to checkout</button>
        </div>
    )

}

export default Cart;
