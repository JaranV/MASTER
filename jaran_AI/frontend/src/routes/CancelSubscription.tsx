import {useState} from "react";

interface SubscriptionData {
    id: number
    stripeSubscriptionId: string
    stripeCustomerId: string
    customerEmail: string
    stripePriceId: string
    status: string
    currentPeriodEnd: string | null
    startDate: string | null
    trialEnd: string | null
}

function CancelSubscription() {
    const [email, setEmail] = useState("")
    const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([])

    const listSubscriptions = () => {
        fetch(import.meta.env.VITE_SERVER_BASE_URL + "/subscriptions/list", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                customerEmail: email,
            })
        })
            .then(r => r.json())
            .then((r: SubscriptionData[]) => {
                setSubscriptions(r)
            })
    }

    const cancelSubscription = (stripeSubscriptionId: string) => {
        fetch(import.meta.env.VITE_SERVER_BASE_URL + "/subscriptions/cancel", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                subscriptionId: stripeSubscriptionId,
            })
        })
            .then(r => r.text())
            .then(() => {
                // Remove cancelled subscription from the list
                setSubscriptions(subscriptions.filter(s => s.stripeSubscriptionId !== stripeSubscriptionId))
            })
    }

    return (
        <div>
            <h1>Cancel Subscription</h1>
            {subscriptions.length === 0 && (
                <div>
                    <input placeholder="Customer Email" onChange={e => setEmail(e.target.value)} value={email} />
                    <button onClick={listSubscriptions}>List Subscriptions</button>
                </div>
            )}
            {subscriptions.map(sub => (
                <div key={sub.stripeSubscriptionId}>
                    <h3>{"Subscription: " + sub.stripePriceId}</h3>
                    <p>{"Status: " + sub.status}</p>
                    {sub.startDate && <p>{"Started: " + sub.startDate}</p>}
                    {sub.currentPeriodEnd && <p>{"Next Payment: " + sub.currentPeriodEnd}</p>}
                    {sub.trialEnd && <p>{"Trial Ends: " + sub.trialEnd}</p>}
                    <button onClick={() => cancelSubscription(sub.stripeSubscriptionId)}>Cancel</button>
                </div>
            ))}
        </div>
    )
}

export default CancelSubscription
