import { gql } from "@apollo/client";

export const GET_ITEMS = gql`
  query GetItems {
    items {
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

export const GET_ITEM_BY_ID = gql`
  query ItemById($id: ID!) {
    itemById(id: $id) {
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

export const GET_CART_ID_BY_EMAIL = gql`
query GetCartIdByEmail($email: String!) {
  getCartIdByEmail(email: $email) {
 cartId
  }
}
`
export const GET_CART_BY_CART_ID = gql`
query GetCartByCartId($cartId: ID!) {
  getCartByCartId(cartId: $cartId) {
    cartId
    cartItems {
      quantity
      itemId
      id
      cartId
      name
      src
      price
      alt
      stock
      description
      length
      height
      width
      weight
      discontinued
      category
    }
  }
}
`
export const GET_CART_BY_EMAIL = gql`
query GetCartByEmail($email: String!) {
  getCartByEmail(email: $email) {
    cartId
    cartItems {
      quantity
      itemId
      id
      cartId
      name
      src
      price
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