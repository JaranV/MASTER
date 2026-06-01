import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

function ProductList({ addToCart }) {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/products`)
            .then(res => res.json())
            .then(setProducts);
    }, []);

    return (
        <div className="products">
            {products.map(product => (
                <div key={product.id} className="product-card">
                    <img src={product.imageUrl} alt={product.name} />
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="price">{product.price} kr</div>
                    <div className="stock">In stock: {product.stock}</div>
                    <button onClick={() => addToCart(product)}>Add to cart</button>
                </div>
            ))}
        </div>
    );
}

export default ProductList;
