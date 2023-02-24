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
