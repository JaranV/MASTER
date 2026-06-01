import type { Product } from '../types.ts'

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const outOfStock = product.stock <= 0

  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} />
      <div className="info">
        <h3>{product.name}</h3>
        <p className="desc">{product.description}</p>
        <span className="price">{product.price} kr</span>
        <p className="stock-info">
          {outOfStock ? (
            <span className="low-stock">Out of stock</span>
          ) : product.stock < 5 ? (
            <span className="low-stock">Only {product.stock} left!</span>
          ) : (
            <>In stock: {product.stock}</>
          )}
        </p>
        <button onClick={onAdd} disabled={outOfStock}>
          {outOfStock ? 'Sold out' : 'Add to cart'}
        </button>
      </div>
    </div>
  )
}

export default ProductCard
