export interface CartItem {
  quantity: number;
  itemId: string;
  id: string;
  cartId: string;
  name: string;
  src: string;
  price: number;
  alt: string;
  stock: number;
  description: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  discontinued: boolean;
  category: string;
}
export interface Cart {
  cartId: string;
  cartItems: CartItem[];
}