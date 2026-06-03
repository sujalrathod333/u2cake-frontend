export interface OrderItem {
  cake: {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number;
    images?: Array<{ url: string }>;
  };
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalPrice: number;
  shippingAddress: ShippingAddress;
  paymentMethod: "COD" | "CARD" | "UPI";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  orderStatus: "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  items: Array<{
    cake: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  shippingAddress: ShippingAddress;
  paymentMethod: "COD" | "CARD" | "UPI";
}

export interface CartItem {
  cakeId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  stock: number;
}

export interface CartItemPayload {
  cakeId: string;
  qty: number;
}
