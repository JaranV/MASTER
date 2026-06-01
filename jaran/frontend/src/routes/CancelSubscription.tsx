import {useState} from "react";
import CartItem from "../components/CartItem.tsx";
import type {ItemData, ServerSubscriptionsResponseType} from "../components/CartItem.tsx";
import {Subscriptions} from "../../data.ts";

function CancelSubscription() {
    const [email, setEmail] = useState("")
    const [subscriptions, setSubscriptions] = useState<ItemData[]>([])

    const onCustomerEmailChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(ev.target.value)
    }

    const listSubscriptions = () => {

        fetch(import.meta.env.VITE_SERVER_BASE_URL + "/subscriptions/list", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                customerEmail: email,
            })
        })
            .then(r => r.json())
            .then((r: ServerSubscriptionsResponseType[]) => {

                const subscriptionsList: ItemData[] = []

                r.forEach(subscriptionItem => {

                    let subscriptionDetails = Subscriptions.find(elem => elem.id === subscriptionItem.appProductId) || undefined

                    if (subscriptionDetails) {

                        subscriptionDetails = {
                            ...subscriptionDetails,
                            price: Number.parseInt(subscriptionItem.price) / 100,
                            stripeSubscriptionData: subscriptionItem,
                        }

                        subscriptionsList.push(subscriptionDetails)
                    } else {
                        console.log("Item not found!")
                    }
                })

                setSubscriptions(subscriptionsList)
            })

    }

    const removeSubscription = (id: string | undefined) => {
        const newSubscriptionsList = subscriptions.filter(elem => (elem.stripeSubscriptionData?.subscriptionId !== id))
        setSubscriptions(newSubscriptionsList)
    }

    return (
        <div>
            <h1>Cancel Subscription</h1>
            {subscriptions.length === 0 && (
                <div>
                    <input placeholder="Customer Email" onChange={onCustomerEmailChange} value={email} />
                    <button onClick={listSubscriptions}>List Subscriptions</button>
                </div>
            )}
            {subscriptions.map(elem => (
                <CartItem key={elem.stripeSubscriptionData?.subscriptionId} data={elem} mode={"subscription"} onCancelled={() => removeSubscription(elem.stripeSubscriptionData?.subscriptionId)} />
            ))}
        </div>
    )
}

export default CancelSubscription