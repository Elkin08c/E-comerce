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
          salePrice
          costPrice
          status
          hasVariants
          isFeatured
          isActive
          tags
          categoryId
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
      salePrice
      costPrice
      status
      hasVariants
      isFeatured
      isActive
      tags
      categoryId
      metaTitle
      metaDescription
      variants {
        id
        name
        sku
        salePrice
        costPrice
        isActive
        attributes {
          color
          storage
          size
          material
          other
        }
      }
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
          description
          isActive
          isFeatured
          products {
            id
            name
            slug
            salePrice
            costPrice
            status
            hasVariants
            isFeatured
            isActive
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
      slug
      description
      products {
        id
        name
        slug
        sku
        salePrice
        costPrice
        status
        hasVariants
        isFeatured
        isActive
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
      status
      paymentStatus
      subtotal
      shippingAmount
      discountAmount
      referralDiscount
      paymentDiscount
      shippingDiscount
      couponDiscount
      campaignDiscount
      totalAmount
      createdAt
      items {
        productName
        variantName
        quantity
        unitPrice
        totalPrice
      }
    }
  }
`;

// ⚠️ NOTA: ShippingMethods y ShippingZones NO están disponibles en GraphQL
// El backend no expone estas queries en el schema GraphQL
// Usar REST API en su lugar:
// - GET /shipping-methods
// - GET /shipping-zones

// export const GET_SHIPPING_METHODS = gql`
//   query GetShippingMethods {
//     shippingMethods: findAllShippingMethods {
//       name
//       type
//       basePrice
//       estimatedDays
//     }
//   }
// `;

// export const GET_SHIPPING_ZONES = gql`
//   query GetShippingZones {
//     shippingZones: findAllShippingZones {
//       id
//       name
//     }
//   }
// `;

export const GET_CUSTOMER_ADDRESSES = gql`
  query GetCustomerAddresses {
    customersAddresses {
      totalCount
      edges {
        node {
          id
          street
          neighborhood
          reference
          zipCode
          cityId
          parishId
          sectorId
          zoneId
          label
          isDefault
          isBillingAddress
          isShippingAddress
          isActive
        }
      }
    }
  }
`;

