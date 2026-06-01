import type {ItemData} from "./CartItem.tsx";
import {useState} from "react"

function CustomerDetails(props: CustomerDetailsProp) {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const onCustomerNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setName(ev.target.value)
    }



    const onCustomerEmailChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(ev.target.value)
    }

    const initiatePayment = () => {
        fetch(import.meta.env.VITE_SERVER_BASE_URL + props.endpoint, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                items: props.data.map(elem => ({name: elem.name, id: elem.id})),
                customerName: name,
                customerEmail: email,
            })
        })
            .then(r => r.text())
            .then(r => {
                window.location.href = r
            })

    }

    return (
        <div>
            <input placeholder="Customer Name" onChange={onCustomerNameChange} value={name} />
            <input placeholder="Customer Email" onChange={onCustomerEmailChange} value={email} />
            <button onClick={initiatePayment}>Checkout</button>
        </div>
    )
}

interface CustomerDetailsProp {
    data: ItemData[]
    endpoint: string
}

export default CustomerDetails