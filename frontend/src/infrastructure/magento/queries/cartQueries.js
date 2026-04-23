export const CART_ITEM_FIELDS = `
  uid
  id
  quantity
  product {
    uid
    sku
    name
    url_key
    image {
      url
      label
    }
    price_range {
      minimum_price {
        regular_price {
          value
          currency
        }
        final_price {
          value
          currency
        }
      }
    }
  }
  ... on ConfigurableCartItem {
    configured_variant {
      uid
      sku
      name
      price_range {
        minimum_price {
          final_price {
            value
            currency
          }
        }
      }
    }
  }
`;

export const CART_PRICE_FIELDS = `
  subtotal {
    value
    currency
  }
  grand_total {
    value
    currency
  }
  total_tax {
    value
    currency
  }
  total_shipping {
    value
    currency
  }
  discounts {
    label
    value
    code
  }
`;

export const CART_ADDRESS_FIELDS = `
  firstname
  lastname
  company
  street
  city
  region
  postcode
  country_code
  telephone
`;

export const CART_SUMMARY_FIELDS = `
  id
  total_quantity
`;

export const CART_DETAIL_FIELDS = `
  id
  total_quantity
  is_virtual
  ${CART_PRICE_FIELDS}
  items {
    ${CART_ITEM_FIELDS}
  }
  shipping_addresses {
    ${CART_ADDRESS_FIELDS}
  }
  billing_address {
    ${CART_ADDRESS_FIELDS}
  }
  available_payment_methods {
    code
    title
  }
`;

export const GUEST_CART_QUERY = `
  query GuestCartQuery($cartId: String!) {
    cart(cart_id: $cartId) {
      ${CART_DETAIL_FIELDS}
    }
  }
`;

export const CUSTOMER_CART_QUERY = `
  query CustomerCartQuery {
    customerCart {
      ${CART_DETAIL_FIELDS}
    }
  }
`;

export const CREATE_GUEST_CART_MUTATION = `
  mutation CreateGuestCartMutation {
    createGuestCart {
      cart {
        ${CART_SUMMARY_FIELDS}
      }
    }
  }
`;

export const ADD_PRODUCTS_TO_CART_MUTATION = `
  mutation AddProductsToCartMutation($cartId: String!, $cartItems: [CartItemInput!]!) {
    addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
      cart {
        ${CART_DETAIL_FIELDS}
      }
      user_errors {
        code
        message
      }
    }
  }
`;

export const UPDATE_CART_ITEM_MUTATION = `
  mutation UpdateCartItemMutation($cartId: String!, $cartItemId: String!, $quantity: Float!) {
    updateCartItems(cartId: $cartId, cartItems: [{ cart_item_id: $cartItemId, quantity: $quantity }]) {
      cart {
        ${CART_DETAIL_FIELDS}
      }
      user_errors {
        code
        message
      }
    }
  }
`;

export const REMOVE_CART_ITEM_MUTATION = `
  mutation RemoveCartItemMutation($cartId: String!, $cartItemId: String!) {
    removeItemFromCart(cartId: $cartId, cartItemId: $cartItemId) {
      cart {
        ${CART_DETAIL_FIELDS}
      }
      user_errors {
        code
        message
      }
    }
  }
`;

export const APPLY_COUPON_TO_CART_MUTATION = `
  mutation ApplyCouponToCartMutation($cartId: String!, $couponCode: String!) {
    applyCouponToCart(cartId: $cartId, couponCode: $couponCode) {
      cart {
        ${CART_DETAIL_FIELDS}
      }
      user_errors {
        code
        message
      }
    }
  }
`;

export const REMOVE_COUPON_FROM_CART_MUTATION = `
  mutation RemoveCouponFromCartMutation($cartId: String!) {
    removeCouponFromCart(cartId: $cartId) {
      cart {
        ${CART_DETAIL_FIELDS}
      }
      user_errors {
        code
        message
      }
    }
  }
`;

export const MERGE_CARTS_MUTATION = `
  mutation MergeCartsMutation($sourceCartId: String!) {
    mergeCarts(source_cart_id: $sourceCartId) {
      ${CART_DETAIL_FIELDS}
    }
  }
`;

export const ESTIMATE_SHIPPING_METHODS_MUTATION = `
  mutation EstimateShippingMethodsMutation($cartId: String!, $address: CartAddressInput!) {
    estimateShippingMethods(cartId: $cartId, address: $address) {
      carrier_code
      method_code
      carrier_title
      method_title
      price {
        value
        currency
      }
      error_message
    }
  }
`;

export const SET_SHIPPING_METHOD_ON_CART_MUTATION = `
  mutation SetShippingMethodOnCartMutation($cartId: String!, $carrierCode: String!, $methodCode: String!) {
    setShippingMethodsOnCart(cartId: $cartId, shippingMethods: [{ carrier_code: $carrierCode, method_code: $methodCode }]) {
      cart {
        ${CART_DETAIL_FIELDS}
      }
      user_errors {
        code
        message
      }
    }
  }
`;

export const SET_GUEST_EMAIL_ON_CART_MUTATION = `
  mutation SetGuestEmailOnCartMutation($cartId: String!, $email: String!) {
    setGuestEmailOnCart(cartId: $cartId, email: $email) {
      cart {
        ${CART_DETAIL_FIELDS}
      }
      user_errors {
        code
        message
      }
    }
  }
`;
