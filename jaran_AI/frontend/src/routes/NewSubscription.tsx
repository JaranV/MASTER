import {useState} from "react";

function NewSubscription() {

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")

    const handleSubscribe = () => {
        fetch(import.meta.env.VITE_SERVER_BASE_URL + "/subscriptions/hosted", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                customerName: name,
                customerEmail: email,
                // Price ID from Stripe Dashboard (recurring monthly product)
                priceId: "price_1TGGe1RHmlVOveWOXEUvhunq",
            })
        })
            .then(r => r.text())
            .then(url => {
                // Redirect to Stripe's hosted checkout page
                window.location.href = url
            })
    }

    return (
        <div>
            <h1>New Subscription</h1>
            <p>Apple Music+ — $4.99/month</p>
            <hr />
            <input placeholder="Customer Name" onChange={e => setName(e.target.value)} value={name} />
            <input placeholder="Customer Email" onChange={e => setEmail(e.target.value)} value={email} />
            <button onClick={handleSubscribe}>Subscribe</button>
        </div>
    )
}

export default NewSubscription
