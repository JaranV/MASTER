export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  postalCode: string;
  city: string;
  shippingZone: number;
  shippingCost: number;
  subtotal: number;
  discount: number;
  totalPrice: number;
  status: "PENDING" | "PAID";
  createdAt: string;
  items: OrderItem[];
}

export interface PostalCodeInfo {
  postalCode: string;
  city: string;
  shippingZone: number;
  shippingCost: number;
}
