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
      salePrice
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
      salePrice
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

// ==================== ÓRDENES ====================

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
    updateOrderStatus(input: $input) {
      id
      orderNumber
      status
      updatedAt
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($input: CancelOrderInput!) {
    cancelOrder(input: $input) {
      id
      orderNumber
      status
      cancelledAt
    }
  }
`;

// ==================== IMÁGENES DE PRODUCTOS ====================

export const CREATE_PRODUCT_IMAGE = gql`
  mutation CreateProductImage($createProductsImageInput: CreateProductsImageInput!) {
    createProductsImage(createProductsImageInput: $createProductsImageInput) {
      id
      url
      altText
      isMain
    }
  }
`;

export const UPDATE_PRODUCT_IMAGE = gql`
  mutation UpdateProductImage($id: String!, $data: UpdateProductsImageInput!) {
    updateProductsImage(id: $id, data: $data) {
      id
      url
      altText
      isMain
    }
  }
`;

export const REMOVE_PRODUCT_IMAGE = gql`
  mutation RemoveProductImage($id: String!) {
    removeProductsImage(id: $id) {
      id
    }
  }
`;

// ==================== RESEÑAS DE PRODUCTOS ====================

export const CREATE_PRODUCT_REVIEW = gql`
  mutation CreateProductReview($createProductReviewInput: CreateProductReviewInput!) {
    createProductReview(createProductReviewInput: $createProductReviewInput) {
      id
      productId
      rating
      title
      comment
    }
  }
`;

export const UPDATE_PRODUCT_REVIEW = gql`
  mutation UpdateProductReview($id: String!, $data: UpdateProductReviewInput!) {
    updateProductReview(id: $id, data: $data) {
      id
      rating
      title
      comment
      isApproved
    }
  }
`;

export const REMOVE_PRODUCT_REVIEW = gql`
  mutation RemoveProductReview($id: String!) {
    removeProductReview(id: $id) {
      id
    }
  }
`;

// ==================== WISHLISTS ====================

export const CREATE_WISHLIST = gql`
  mutation CreateWishlist($createWishlistInput: CreateWishlistInput!) {
    createWishlist(createWishlistInput: $createWishlistInput) {
      id
      productId
      variantId
    }
  }
`;

export const REMOVE_WISHLIST = gql`
  mutation RemoveWishlist($id: String!) {
    removeWishlist(id: $id) {
      id
    }
  }
`;

