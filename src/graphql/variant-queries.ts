import { gql } from "@apollo/client";

// ==================== VARIANTES DE PRODUCTOS ====================

export const GET_PRODUCT_VARIANTS = gql`
  query GetProductVariants($first: Int, $after: String) {
    productVariants(first: $first, after: $after) {
      totalCount
      edges {
        node {
          id
          productId
          name
          sku
          salePrice
          costPrice
          weight
          dimensions {
            width
            height
            length
            color
          }
          attributes {
            color
            storage
            size
            material
            other
          }
          isActive
          sortOrder
          createdAt
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_PRODUCT_VARIANT = gql`
  query GetProductVariant($id: String!) {
    productVariant(id: $id) {
      id
      productId
      name
      sku
      salePrice
      costPrice
      weight
      dimensions {
        width
        height
        length
        color
      }
      attributes {
        color
        storage
        size
        material
        other
      }
      isActive
      sortOrder
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_PRODUCT_VARIANT = gql`
  mutation CreateProductVariant($createProductVariantInput: CreateProductVariantInput!) {
    createProductVariant(createProductVariantInput: $createProductVariantInput) {
      id
      productId
      name
      sku
      salePrice
      costPrice
      isActive
    }
  }
`;

export const UPDATE_PRODUCT_VARIANT = gql`
  mutation UpdateProductVariant($id: String!, $data: UpdateProductVariantInput!) {
    updateProductVariant(id: $id, data: $data) {
      id
      productId
      name
      sku
      salePrice
      costPrice
      isActive
    }
  }
`;

export const REMOVE_PRODUCT_VARIANT = gql`
  mutation RemoveProductVariant($id: String!) {
    removeProductVariant(id: $id) {
      id
    }
  }
`;
