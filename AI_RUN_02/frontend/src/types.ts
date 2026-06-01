export interface Product {
  id: number; name: string; description: string;
  price: number; stock: number; imageUrl: string;
}
export interface CartItem { product: Product; quantity: number; }
export interface OrderItem { id: number; product: Product; quantity: number; price: number; }
export interface Order {
  id: number; email: string; name: string; address: string;
  phone: string; postalCode: string; city: string;
  shippingZone: number; shippingCost: number;
  subtotal: number; discount: number; totalPrice: number;
  status: string; createdAt: string; items: OrderItem[];
}
