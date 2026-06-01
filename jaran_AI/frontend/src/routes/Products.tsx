import {useEffect, useState} from "react";

interface Product {
    id: number
    name: string
    description: string
    price: number
    stock: number
    imageUrl: string
}

function Products() {

    const [products, setProducts] = useState<Product[]>([])

    useEffect(() => {
        fetch(import.meta.env.VITE_SERVER_BASE_URL + "/products")
            .then(r => r.json())
            .then(r => setProducts(r))
    }, [])

    return (
        <div>
            <h1>Products</h1>
            {products.map(product => (
                <div key={product.id}>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <p>{"$" + product.price}</p>
                    <p>{"Stock: " + product.stock}</p>
                </div>
            ))}
        </div>
    )
}

export default Products
