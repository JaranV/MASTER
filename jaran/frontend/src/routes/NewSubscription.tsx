import {useEffect, useState} from "react";
import TotalFooter from "../components/TotalFooter.tsx";
import {Elements, PaymentElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import type {Stripe} from '@stripe/stripe-js';

function NewSubscription() {

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
        // Make sure to call `loadStripe` outside of a component's render to avoid
        // recreating the `Stripe` object on every render.
        setStripePromise(loadStripe(import.meta.env.VITE_STRIPE_API_KEY || ""));
    }, [])

    const createSubscription = () => {
        fetch(import.meta.env.VITE_SERVER_BASE_URL + "/subscriptions/new", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                customerName: name,
                customerEmail: email,
                // Price ID from Stripe Dashboard for monthly subscription
                priceId: "price_1TGGe1RHmlVOveWOXEUvhunq",
            })
        })
            .then(r => r.text())
            .then(r => {
                setTransactionClientSecret(r)
            })
    }

    return (
        <div>
            <h1>New Subscription</h1>
            <TotalFooter total={4.99} mode={"subscription"} />
            <input placeholder="Customer Name" onChange={onCustomerNameChange} value={name} />
            <input placeholder="Customer Email" onChange={onCustomerEmailChange} value={email} />
            <button onClick={createSubscription}>Subscribe</button>
            {transactionClientSecret !== "" && (
                <Elements stripe={stripePromise} options={{clientSecret: transactionClientSecret}}>
                    <SubscriptionForm/>
                </Elements>
            )}
        </div>
    )
}

// Same pattern as CheckoutForm — must be separate so useStripe/useElements are inside <Elements>
const SubscriptionForm = () => {

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

export default NewSubscription
