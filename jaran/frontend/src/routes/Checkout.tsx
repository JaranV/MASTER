import {useEffect, useState} from "react";
import type {ItemData} from "../components/CartItem.tsx";
import CartItem from "../components/CartItem.tsx";
import TotalFooter from "../components/TotalFooter.tsx";
import {Products} from '../../data.ts'
import {Elements, PaymentElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import type {Stripe} from '@stripe/stripe-js';

//main page
function Checkout() {

    const [items] = useState<ItemData[]>(Products)
    const [transactionClientSecret, setTransactionClientSecret] = useState("")
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const onCustomerNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setName(ev.target.value)
    }

    const onCustomerEmailChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(ev.target.value)
    }

    useEffect(() => {
        // Make sure to call `loadStripe` outside of a component’s render to avoid
        // recreating the `Stripe` object on every render.
        setStripePromise(loadStripe(import.meta.env.VITE_STRIPE_API_KEY || ""));

    }, [])

    const createTransactionSecret = () => {
        fetch(import.meta.env.VITE_SERVER_BASE_URL + "/checkout", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                items: items.map(elem => ({name: elem.name, id: elem.id})),
                customerName: name,
                customerEmail: email,
            })
        })
            .then(r => r.text())
            .then(r => {
                setTransactionClientSecret(r)
            })
    }

    return (
        <div>
            <h1>Checkout</h1>
            {items.map(elem => (
                <CartItem key={elem.id} data={elem} mode={"checkout"} />
            ))}
            <TotalFooter total={30} mode={"checkout"} />
            <input placeholder="Customer Name" onChange={onCustomerNameChange} value={name} />
            <input placeholder="Customer Email" onChange={onCustomerEmailChange} value={email} />
            <button onClick={createTransactionSecret}>Initiate Payment</button>
            {transactionClientSecret !== "" && (
                <Elements stripe={stripePromise} options={{clientSecret: transactionClientSecret}}>
                    <CheckoutForm/>
                </Elements>
            )}
        </div>
    )
}

// the payment form 
const CheckoutForm = () => {

    const stripe = useStripe();
    const elements = useElements();
    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: import.meta.env.VITE_CLIENT_BASE_URL + "/success",
            },
        });

        if (result.error) {
            console.log(result.error.message);
        }
    };

    return (
        <div>
            <PaymentElement/>
            <button disabled={!stripe} onClick={handleSubmit}>Pay</button>
        </div>
    )
}

export default Checkout