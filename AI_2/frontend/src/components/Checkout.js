import React, { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useDiscount } from "../hooks/useDiscount";
import { usePhoneValidation } from "../hooks/usePhoneValidation";
import { usePostalCode } from "../hooks/usePostalCode";
import DiscountBanner from "./DiscountBanner";
import PhoneInput from "./PhoneInput";
import PostalCodeInput from "./PostalCodeInput";

function Checkout({ cart, clearCart }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        addr: ''
    });

    const [loading, setLoading] = useState(false);

    const { subtotal, discount, total: discountedTotal, hasDiscount } = useDiscount(cart);
    const phone = usePhoneValidation();
    const postalCode = usePostalCode();

    const total = discountedTotal + postalCode.shippingCost;

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!phone.isValid || !postalCode.isValid) {
            return;
        }

        setLoading(true);

        try {
            const orderRes = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    address: form.addr,
                    phone: phone.getNormalizedValue(),
                    cartItems: cart.map(item => ({
                        productid: item.product.id,
                        count: item.count
                    }))
                })
            });

            const order = await orderRes.json();

            const payRes = await fetch(`${API_BASE_URL}/orders/${order.id}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const payment = await payRes.json();

            clearCart();

            window.location.href = payment.url;
        } catch (err) {
            alert('Something went wrong, please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return <p className="empty-message">Cart is empty. <Link to="/">Continue shopping</Link></p>;
    }

    return (
        <div>
            <h2>Checkout</h2>
            <DiscountBanner
                subtotal={subtotal}
                discount={discount}
                total={discountedTotal}
                hasDiscount={hasDiscount}
            />
            {postalCode.isValid && (
                <p>Shipping ({postalCode.zoneName}): {postalCode.shippingCost} kr</p>
            )}
            <p><strong>Total: {total.toFixed(2)} kr</strong></p>

            <form onSubmit={handleSubmit}>
                <label>Name</label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <label>Email</label>
                <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <PhoneInput
                    value={phone.rawValue}
                    onChange={phone.handleChange}
                    isValid={phone.isValid}
                    errorMessage={phone.errorMessage}
                />

                <label>Address</label>
                <input
                    name="addr"
                    value={form.addr}
                    onChange={handleChange}
                    required
                />

                <PostalCodeInput
                    value={postalCode.rawValue}
                    onChange={postalCode.handleChange}
                    isLoading={postalCode.isLoading}
                    isValid={postalCode.isValid}
                    isNotFound={postalCode.isNotFound}
                    city={postalCode.city}
                    zoneName={postalCode.zoneName}
                    shippingCost={postalCode.shippingCost}
                    errorMessage={postalCode.errorMessage}
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Pay with Stripe'}
                </button>
            </form>
        </div>
    );
}

export default Checkout;
