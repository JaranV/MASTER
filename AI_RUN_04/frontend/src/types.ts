export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
};

export type CartItem = {
  productId: number;
  quantity: number;
};

export type OrderItem = {
  id: number;
  product: Product;
  quantity: number;
  price: number;
};

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

export type Order = {
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
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
};

export type CreateOrderRequest = {
  name: string;
  email: string;
  address: string;
  phone: string;
  postalCode: string;
  cartItems: CartItem[];
};
