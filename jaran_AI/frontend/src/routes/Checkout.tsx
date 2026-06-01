import {useEffect, useState} from "react";

interface Product {
    id: number
    name: string
    description: string
    price: number
    stock: number
    imageUrl: string
}

interface CartItem {
    product: Product
    count: number
}

function Checkout() {

    const [products, setProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")

    useEffect(() => {
        fetch(import.meta.env.VITE_SERVER_BASE_URL + "/products")
            .then(r => r.json())
            .then((r: Product[]) => {
                setProducts(r)
                // Start each product with count 0
                setCart(r.map(p => ({product: p, count: 0})))
            })
    }, [])

    const updateCount = (productId: number, delta: number) => {
        setCart(cart.map(item => {
            if (item.product.id === productId) {
                const newCount = Math.max(0, item.count + delta)
                return {...item, count: newCount}
            }
            return item
        }))
    }

    const getTotal = () => {
        return cart.reduce((sum, item) => sum + item.product.price * item.count, 0)
    }

    const handleCheckout = () => {
        // Only send items with count > 0
        const itemsToSend = cart
            .filter(item => item.count > 0)
            .map(item => ({productId: item.product.id, count: item.count}))

        if (itemsToSend.length === 0) {
            alert("Add at least one item to your cart")
            return
        }

        fetch(import.meta.env.VITE_SERVER_BASE_URL + "/checkout/hosted", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                items: itemsToSend,
                customerName: name,
                customerEmail: email,
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
            <h1>Checkout</h1>
            {products.map(product => {
                const cartItem = cart.find(c => c.product.id === product.id)
                return (
                    <div key={product.id}>
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p>{"$" + product.price}</p>
                        <div>
                            <button onClick={() => updateCount(product.id, -1)}>-</button>
                            <span>{" " + (cartItem?.count || 0) + " "}</span>
                            <button onClick={() => updateCount(product.id, 1)}>+</button>
                        </div>
                    </div>
                )
            })}
            <hr />
            <p>{"Total: $" + getTotal()}</p>
            <input placeholder="Customer Name" onChange={e => setName(e.target.value)} value={name} />
            <input placeholder="Customer Email" onChange={e => setEmail(e.target.value)} value={email} />
            <button onClick={handleCheckout}>Pay</button>
        </div>
    )
}

export default Checkout
