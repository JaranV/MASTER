import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const BACKEND = 'http://localhost:8080/api';

const formFields = [
    { name: 'name', label: 'Name', placeholder: '' },
    { name: 'email', label: 'Email', placeholder: '' },
    { name: 'phone', label: 'Phone', placeholder: '41234567' },
    { name: 'addr', label: 'Address', placeholder: '' },
];

function Checkout({ basket, emptyBasket }) {
    const [info, setInfo] = useState({
        name: '',
        email: '',
        addr: '',
        phone: '',
        postnr: ''
    });

    const [busy, setBusy] = useState(false);
    const [postalCodes, setPostalCodes] = useState({});
    const [cityName, setCityName] = useState('');
    const [shippingCost, setShippingCost] = useState(0);

    // read postal code file
    useEffect(() => {
        fetch('/postnummer.csv')
            .then(response => response.text())
            .then(text => {
                const lines = text.trim().split('\n');
                const lookup = {};
                for (let i = 1; i < lines.length; i++) {
                    const columns = lines[i].split('\t');
                    lookup[columns[0]] = columns[1];
                }
                setPostalCodes(lookup);
            });
    }, []);

    // find city and shipping when postnr changes
    useEffect(() => {
        const postnr = info.postnr.trim();
        if (postnr.length === 4 && postalCodes[postnr]) {
            setCityName(postalCodes[postnr]);
            const postnrNum = parseInt(postnr);
            if (postnrNum < 5000) setShippingCost(49);
            else if (postnrNum < 8000) setShippingCost(79);
            else setShippingCost(99);
        } else {
            setCityName('');
            setShippingCost(0);
        }
    }, [info.postnr, postalCodes]);

    let subtotal = 0;
    for (let i = 0; i < basket.length; i++) {
        subtotal += basket[i].product.price * basket[i].qty;
    }
    const discount = subtotal > 500 ? subtotal * 0.1 : 0;
    const totalPrice = subtotal - discount + shippingCost;

    const onChange = (event) => {
        setInfo(old => ({ ...old, [event.target.name]: event.target.value }));
    };

    function buildOrderPayload() {
        const items = [];
        for (let i = 0; i < basket.length; i++) {
            items.push({
                productid: basket[i].product.id,
                count: basket[i].qty
            });
        }
        return {
            name: info.name,
            email: info.email,
            address: info.addr,
            phone: info.phone,
            cartItems: items
        };
    }

    const send = async (event) => {
        event.preventDefault();
        setBusy(true);

        // phone number check
        if (!/^[49]\d{7}$/.test(info.phone)) {
            alert('Enter a valid Norwegian phone number (8 digits, starts with 4 or 9)');
            setBusy(false);
            return;
        }

        if (!cityName) {
            alert('Enter a valid postal code');
            setBusy(false);
            return;
        }

        try {
            // step 1: create order
            const orderResponse = await fetch(`${BACKEND}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buildOrderPayload())
            });
            const createdOrder = await orderResponse.json();

            // step 2: get payment link
            const payResponse = await fetch(`${BACKEND}/orders/${createdOrder.id}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const paymentData = await payResponse.json();

            // step 3: redirect to stripe
            emptyBasket();
            window.location.href = paymentData.url;
        } catch (error) {
            alert('Something went wrong, try again');
            console.error(error);
        } finally {
            setBusy(false);
        }
    };

    if (basket.length === 0) {
        return <p>Basket is empty. <Link to="/">Keep shopping</Link></p>;
    }

    return (
        <div className="checkout-page">
            <h2>Checkout</h2>

            <div className="price-summary">
                <p>Subtotal: {subtotal.toFixed(2)} kr</p>
                {discount > 0 && <p className="discount-text">10% rabatt: -{discount.toFixed(2)} kr</p>}
                {shippingCost > 0 && <p>Frakt: {shippingCost} kr</p>}
                <p><strong>Total: {totalPrice.toFixed(2)} kr</strong></p>
            </div>

            <form onSubmit={send} className="checkout-form">
                {formFields.map(field => (
                    <div className="field" key={field.name}>
                        <label>{field.label}</label>
                        <input
                            name={field.name}
                            value={info[field.name]}
                            onChange={onChange}
                            placeholder={field.placeholder}
                            required
                        />
                    </div>
                ))}

                <div className="field">
                    <label>Postal Code</label>
                    <input name="postnr" value={info.postnr} onChange={onChange} placeholder="4006" maxLength={4} required />
                    {cityName && <small>City: {cityName} — Frakt: {shippingCost} kr</small>}
                    {info.postnr.length === 4 && !cityName && <small className="error-text">Unknown postal code</small>}
                </div>

                <button type="submit" disabled={busy}>
                    {busy ? 'Working...' : 'Pay with Stripe'}
                </button>
            </form>
        </div>
    );
}

export default Checkout;
