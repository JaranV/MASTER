function CartItem(props: CartItemProps) {

    // Cancel the selected subscription
    const cancelSubscription = () => {
        fetch(import.meta.env.VITE_SERVER_BASE_URL + "/subscriptions/cancel", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                subscriptionId: props.data.stripeSubscriptionData?.id
            })
        })
            .then(r => r.text())
            .then(() => {
                if (props.onCancelled)
                    props.onCancelled()
            })
    }

    return (
        <div>
            <img src={props.data.image} alt={props.data.name} />
            <h3>{props.data.name}</h3>
            <p>{props.data.description}</p>
            {props.mode === "checkout" && <p>{"Quantity: " + props.data.quantity}</p>}

            {/* Subscription details */}
            {props.mode === "subscription" && props.data.stripeSubscriptionData && (
                <div>
                    <p>{"Next Payment Date: " + new Date(props.data.stripeSubscriptionData.current_period_end * 1000).toLocaleDateString()}</p>
                    <p>{"Subscribed On: " + new Date(props.data.stripeSubscriptionData.start_date * 1000).toLocaleDateString()}</p>
                    {props.data.stripeSubscriptionData.trial_end && (
                        <p>{"Free Trial Running Until: " + new Date(props.data.stripeSubscriptionData.trial_end * 1000).toLocaleDateString()}</p>
                    )}
                </div>
            )}

            <p>{"$" + props.data.price}</p>

            {/* Cancel subscription button */}
            {props.data.stripeSubscriptionData && (
                <button onClick={cancelSubscription}>Cancel Subscription</button>
            )}
        </div>
    )
}

// UPDATE
// Mirrors the relevant fields from Stripe's Subscription object
export interface StripeSubscriptionData {
    id: string
    status: string
    current_period_end: number
    start_date: number
    trial_end?: number
    items: {
        data: {
            price: {
                id: string
                unit_amount: number
            }
        }[]
    }
}

export interface ItemData {
    name: string
    price: number
    quantity: number
    image: string
    description: string
    id: string
    stripeSubscriptionData?: StripeSubscriptionData
}

interface CartItemProps {
    data: ItemData
    mode: "subscription" | "checkout"
    onCancelled?: () => void
}

export default CartItem