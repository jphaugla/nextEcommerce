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
