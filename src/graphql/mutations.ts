import { gql } from "@apollo/client";

// --- CATEGORIES MUTATIONS ---

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($createCategoryInput: CreateCategoryInput!) {
    createCategory(createCategoryInput: $createCategoryInput) {
      id
      name
      slug
      isActive
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: String!, $data: UpdateCategoryInput!) {
    updateCategory(id: $id, data: $data) {
      id
      name
      slug
      isActive
    }
  }
`;

export const REMOVE_CATEGORY = gql`
  mutation RemoveCategory($id: String!) {
    removeCategory(id: $id) {
      id
    }
  }
`;

// --- PRODUCTS MUTATIONS ---

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($createProductInput: CreateProductInput!) {
    createProduct(createProductInput: $createProductInput) {
      id
      name
      sku
      basePrice
      isActive
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $data: UpdateProductInput!) {
    updateProduct(id: $id, data: $data) {
      id
      name
      sku
      basePrice
      isActive
    }
  }
`;

export const REMOVE_PRODUCT = gql`
  mutation RemoveProduct($id: String!) {
    removeProduct(id: $id) {
      id
    }
  }
`;

export const CHECKOUT = gql`
  mutation Checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      success
      orderId
      orderNumber
      paymentId
      paymentStatus
      totalAmount
      message
    }
  }
`;

