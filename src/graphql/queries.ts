import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts($first: Int, $after: String) {
    products(first: $first, after: $after) {
      totalCount
      edges {
        node {
          id
          name
          sku
          basePrice
          isActive
          stock: weight # Placeholder, adjusting based on Schema
          tags
        }
      }
    }
  }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: String!) {
    product(id: $id) {
      id
      name
      description
      basePrice
      sku
      stock: weight # Placeholder
      tags
      category: categoryId
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      totalCount
      edges {
        node {
          id
          name
          slug
          isActive
          products {
             id
          }
        }
      }
    }
  }
`;

export const GET_ORDERS = gql`
  query GetOrders($first: Int) {
    orders(first: $first) {
      totalCount
      edges {
        node {
          id
          orderNumber
          totalAmount
          status
          createdAt
          customer {
            firstName
            lastName
            email
          }
        }
      }
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users: customers { # Using customers for now as users query might be different or protected differently
      totalCount
      edges {
        node {
           id
           email
           firstName
           lastName
           isActive
        }
      }
    }
  }
`;
