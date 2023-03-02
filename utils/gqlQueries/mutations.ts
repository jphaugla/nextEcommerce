import { gql } from "@apollo/client";

export const ADD_NEW_ITEM = gql`
  mutation AddNewItem(
    $name: String!
    $src: String!
    $price: Float!
    $alt: String!
    $stock: Int!
    $description: String!
    $length: Float!
    $width: Float!
    $height: Float!
    $weight: Float!
    $discontinued: Boolean!
    $category: String!
  ) {
    addNewItem(
      name: $name
      src: $src
      price: $price
      alt: $alt
      stock: $stock
      description: $description
      length: $length
      width: $width
      height: $height
      weight: $weight
      discontinued: $discontinued
      category: $category
    ) {
      name
      src
      price
      alt
      stock
      description
      length
      width
      height
      weight
      discontinued
      category
    }
  }
`;
export const UPDATE_ITEM = gql`
  mutation UpdateItem(
    $id: ID!
    $name: String!
    $src: String!
    $price: Float!
    $alt: String!
    $stock: Int!
    $description: String!
    $length: Float!
    $width: Float!
    $height: Float!
    $weight: Float!
    $discontinued: Boolean!
    $category: String!
  ) {
    updateItem(
      id: $id
      name: $name
      src: $src
      price: $price
      alt: $alt
      stock: $stock
      description: $description
      length: $length
      width: $width
      height: $height
      weight: $weight
      discontinued: $discontinued
      category: $category
    ) {
      id
      name
      src
      price
      alt
      stock
      description
      length
      width
      height
      weight
      discontinued
      category
    }
  }
`;

export const ADD_CART_ITEM = gql`
mutation AddCartItem($itemId: ID!, $cartId: ID!, $quantity: Int!) {
  addCartItem(itemId: $itemId, cartId: $cartId, quantity: $quantity) {
    cartId
    cartItems {
      name
      price
      quantity
      itemId
      id
      cartId
      src
      alt
      stock
      length
      description
      width
      height
      weight
      discontinued
      category
    }
  }
}
`
export const UPDATE_CART_ITEM = gql`
mutation UpdateCartItem($itemId: ID!, $cartId: ID!, $quantity: Int!) {
  updateCartItem(itemId: $itemId, cartId: $cartId, quantity: $quantity) {
    cartId
    cartItems {
      name
      price
      quantity
      itemId
      id
      cartId
      src
      alt
      stock
      length
      description
      width
      height
      weight
      discontinued
      category
    }
  }
}
`
export const REMOVE_CART_ITEM = gql`
mutation RemoveCartItem($cartId: ID!, $itemId: ID!) {
  RemoveCartItem(cartId: $cartId, itemId: $itemId) {
    cartId
    cartItems {
      name
      itemId
      quantity
      id
      cartId
      src
      price
      alt
      stock
      description
      length
      width
      height
      weight
      discontinued
      category
    }
  }
}
`
