export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
}

export interface CartEntry {
  product: Product
  count: number
}
