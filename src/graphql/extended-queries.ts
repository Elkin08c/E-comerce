import { gql } from "@apollo/client";

// ==================== COMBOS DE PRODUCTOS ====================

export const GET_PRODUCT_COMBOS = gql`
  query GetProductCombos($first: Int, $after: String) {
    productCombos(first: $first, after: $after) {
      totalCount
      edges {
        node {
          id
          name
          slug
          description
          sku
          finalPrice
          originalPrice
          discountAmount
          discountPercent
          status
          isFeatured
          isActive
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const GET_PRODUCT_COMBO = gql`
  query GetProductCombo($id: String!) {
    productCombo(id: $id) {
      id
      name
      slug
      description
      shortDescription
      sku
      finalPrice
      originalPrice
      discountAmount
      discountPercent
      totalWeight
      status
      isFeatured
      isActive
      productComboItems {
        id
        productId
        name
        quantity
        itemBasePrice
        itemDiscountAmount
      }
    }
  }
`;

export const CREATE_PRODUCT_COMBO = gql`
  mutation CreateProductCombo($createProductComboInput: CreateProductComboInput!) {
    createProductCombo(createProductComboInput: $createProductComboInput) {
      id
      name
      slug
      finalPrice
      isActive
    }
  }
`;

export const UPDATE_PRODUCT_COMBO = gql`
  mutation UpdateProductCombo($updateProductComboInput: UpdateProductComboInput!) {
    updateProductCombo(updateProductComboInput: $updateProductComboInput) {
      id
      name
      finalPrice
      isActive
    }
  }
`;

export const REMOVE_PRODUCT_COMBO = gql`
  mutation RemoveProductCombo($id: String!) {
    removeProductCombo(id: $id) {
      id
    }
  }
`;

// ==================== ATRIBUTOS DE PRODUCTOS ====================

export const GET_ATTRIBUTE_GROUPS = gql`
  query GetAttributeGroups {
    attributeGroups {
      id
      name
      isRequired
      sortOrder
      isActive
    }
  }
`;

export const CREATE_ATTRIBUTE_GROUP = gql`
  mutation CreateAttributeGroup($createAttributeGroupInput: CreateAttributeGroupInput!) {
    createAttributeGroup(createAttributeGroupInput: $createAttributeGroupInput) {
      id
      name
      isRequired
      sortOrder
    }
  }
`;

export const UPDATE_ATTRIBUTE_GROUP = gql`
  mutation UpdateAttributeGroup($id: String!, $data: UpdateAttributeGroupInput!) {
    updateAttributeGroup(id: $id, data: $data) {
      id
      name
      isRequired
      sortOrder
    }
  }
`;

export const REMOVE_ATTRIBUTE_GROUP = gql`
  mutation RemoveAttributeGroup($id: String!) {
    removeAttributeGroup(id: $id) {
      id
    }
  }
`;

export const GET_PRODUCT_ATTRIBUTES = gql`
  query GetProductAttributes($first: Int, $after: String) {
    productAttributes(first: $first, after: $after) {
      totalCount
      edges {
        node {
          id
          productId
          groupId
          name
          value
          sortOrder
          isActive
        }
      }
    }
  }
`;

export const CREATE_PRODUCT_ATTRIBUTE = gql`
  mutation CreateProductAttribute($createProductAttributeInput: CreateProductAttributeInput!) {
    createProductAttribute(createProductAttributeInput: $createProductAttributeInput) {
      id
      productId
      name
      value
    }
  }
`;

export const UPDATE_PRODUCT_ATTRIBUTE = gql`
  mutation UpdateProductAttribute($id: String!, $data: UpdateProductAttributeInput!) {
    updateProductAttribute(id: $id, data: $data) {
      id
      name
      value
    }
  }
`;

export const REMOVE_PRODUCT_ATTRIBUTE = gql`
  mutation RemoveProductAttribute($id: String!) {
    removeProductAttribute(id: $id) {
      id
    }
  }
`;

// ==================== MÉTODOS DE ENVÍO ====================
// ⚠️ NOTA: Estos no existen en GraphQL. Usar REST API.

/*
export const CREATE_SHIPPING_METHOD = gql`
  mutation CreateShippingMethod($createShippingMethodInput: CreateShippingMethodInput!) {
    createShippingMethod(createShippingMethodInput: $createShippingMethodInput) {
      name
      type
      salePrice
      estimatedDays
    }
  }
`;

export const UPDATE_SHIPPING_METHOD = gql`
  mutation UpdateShippingMethod($updateShippingMethodInput: UpdateShippingMethodInput!) {
    updateShippingMethod(updateShippingMethodInput: $updateShippingMethodInput) {
      name
      type
      salePrice
      estimatedDays
    }
  }
`;

export const REMOVE_SHIPPING_METHOD = gql`
  mutation RemoveShippingMethod($id: String!) {
    removeShippingMethod(id: $id) {
      name
    }
  }
`;
*/

// ==================== ZONAS DE ENVÍO ====================
// ⚠️ NOTA: Estos no existen en GraphQL. Usar REST API.

/*
export const CREATE_SHIPPING_ZONE = gql`
  mutation CreateShippingZone($createShippingZoneInput: CreateShippingZoneInput!) {
    createShippingZone(createShippingZoneInput: $createShippingZoneInput) {
      id
      name
    }
  }
`;

export const UPDATE_SHIPPING_ZONE = gql`
  mutation UpdateShippingZone($updateShippingZoneInput: UpdateShippingZoneInput!) {
    updateShippingZone(updateShippingZoneInput: $updateShippingZoneInput) {
      id
      name
    }
  }
`;

export const REMOVE_SHIPPING_ZONE = gql`
  mutation RemoveShippingZone($id: String!) {
    removeShippingZone(id: $id) {
      id
    }
  }
`;
*/

// ==================== CLIENTES ====================

export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($createCustomerInput: CreateCustomerInput!) {
    createCustomer(createCustomerInput: $createCustomerInput) {
      id
      email
      firstName
      lastName
      phone
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: String!, $data: UpdateCustomerInput!) {
    updateCustomer(id: $id, data: $data) {
      id
      email
      firstName
      lastName
      phone
    }
  }
`;

export const REMOVE_CUSTOMER = gql`
  mutation RemoveCustomer($id: String!) {
    removeCustomer(id: $id) {
      id
    }
  }
`;

// ==================== DIRECCIONES DE CLIENTES ====================

export const CREATE_CUSTOMER_ADDRESS = gql`
  mutation CreateCustomerAddress($createCustomersAddressInput: CreateCustomersAddressInput!) {
    createCustomersAddress(createCustomersAddressInput: $createCustomersAddressInput) {
      id
      street
      cityId
      zipCode
      isDefault
    }
  }
`;

export const UPDATE_CUSTOMER_ADDRESS = gql`
  mutation UpdateCustomerAddress($id: String!, $data: UpdateCustomersAddressInput!) {
    updateCustomersAddress(id: $id, data: $data) {
      id
      street
      cityId
      zipCode
      isDefault
    }
  }
`;

export const REMOVE_CUSTOMER_ADDRESS = gql`
  mutation RemoveCustomerAddress($id: String!) {
    removeCustomersAddress(id: $id) {
      id
    }
  }
`;
