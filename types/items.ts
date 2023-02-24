export type Product = {
  __typename: string;
  id: string;
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
};