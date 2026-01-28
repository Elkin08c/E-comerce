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
          salePrice
          isActive
          stock: weight # Placeholder, adjusting based on Schema
          tags
          category: categoryId
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
      salePrice
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

export const GET_CATEGORY_BY_SLUG = gql`
  query GetCategoryBySlug($slug: String!) {
    categoriesBySlug(slug: $slug) {
      id
      name
      description
      products {
        id
        name
        sku
        basePrice
        salePrice
        isActive
        stock: weight # Placeholder
        tags
      }
    }
  }
`;

export const GET_CUSTOMER_ORDERS = gql`
  query GetCustomerOrders($input: OrdersByCustomerInput!) {
    ordersByCustomer(input: $input) {
      id
      orderNumber
      totalAmount
      status
      createdAt
      items {
        productName
        quantity
        unitPrice
        totalPrice
      }
    }
  }
`;
