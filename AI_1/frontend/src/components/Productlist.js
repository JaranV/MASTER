import React, { useEffect, useState} from "react";

const BACKEND = 'http://localhost:8080/api';

function ProductList({ putInBasket }) {

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${BACKEND}/products`)
        .then(response => response.json())
        .then(data => setProducts(data))
    }, []);

    if (products.length === 0) {
        return <p>loading products...</p>
    }

    const filtered = [];
    for (let i = 0; i < products.length; i++) {
        if (products[i].name.toLowerCase().includes(search.toLowerCase())) {
            filtered.push(products[i]);
        }
    }

    return (
        <div>
            <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '15px', border: '1px solid #aaa' }}
            />
            {filtered.length === 0 && <p>No products found.</p>}
        <div className="item-grid">
            {filtered.map(product => (
                <div key={product.id} className="item-box">
                    <img src={product.image_url} alt={product.name} />
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <span className="pricetag">{product.price} kr</span>
                    <br/>
                    <span>In stock: {product.stock}</span>
                    {product.stock < 5 && product.stock > 0 && <span className="low-stock">Only {product.stock} left!</span>}
                    <button onClick={() => putInBasket(product)}>put in basket</button>
                </div>
            ))}
        </div>
        </div>
    )
}

export default ProductList;
