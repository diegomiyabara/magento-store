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
  subtotal_excluding_tax {
    value
    currency
  }
  grand_total {
    value
    currency
  }
  discounts {
    label
    amount {
      value
      currency
    }
  }
  applied_taxes {
    label
    amount {
      value
      currency
    }
  }
`;

export const SELECTED_SHIPPING_METHOD_FIELDS = `
  carrier_code
  method_code
  carrier_title
  method_title
  amount {
    value
    currency
  }
`;

export const AVAILABLE_SHIPPING_METHOD_FIELDS = `
  carrier_code
  method_code
  carrier_title
  method_title
  error_message
  available
  amount {
    value
    currency
  }
`;

export const APPLIED_COUPON_FIELDS = `
  code
`;

export const CART_ADDRESS_FIELDS = `
  firstname
  lastname
  company
  street
  city
  region {
    code
    label
    region_id
  }
  postcode
  country {
    code
    label
  }
  telephone
`;

export const CART_EMAIL_FIELDS = `
  email
`;

export const CART_PAYMENT_FIELDS = `
  available_payment_methods {
    code
    title
  }
  selected_payment_method {
    code
    title
    purchase_order_number
  }
`;

export const CART_SHIPPING_ADDRESS_FIELDS = `
  ${CART_ADDRESS_FIELDS}
  available_shipping_methods {
    ${AVAILABLE_SHIPPING_METHOD_FIELDS}
  }
  selected_shipping_method {
    ${SELECTED_SHIPPING_METHOD_FIELDS}
  }
`;

export const CART_BILLING_ADDRESS_FIELDS = `
  ${CART_ADDRESS_FIELDS}
`;

export const CART_PRICES_FIELDS = `
  prices {
    ${CART_PRICE_FIELDS}
  }
`;

export const CART_SUMMARY_FIELDS = `
  id
  total_quantity
`;

export const CART_DETAIL_FIELDS = `
  id
  total_quantity
  is_virtual
  ${CART_EMAIL_FIELDS}
  applied_coupons {
    ${APPLIED_COUPON_FIELDS}
  }
  ${CART_PRICES_FIELDS}
  items {
    ${CART_ITEM_FIELDS}
  }
  shipping_addresses {
    ${CART_SHIPPING_ADDRESS_FIELDS}
  }
  billing_address {
    ${CART_BILLING_ADDRESS_FIELDS}
  }
  ${CART_PAYMENT_FIELDS}
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
  mutation UpdateCartItemMutation($cartId: String!, $cartItemUid: ID!, $quantity: Float!) {
    updateCartItems(input: { cart_id: $cartId, cart_items: [{ cart_item_uid: $cartItemUid, quantity: $quantity }] }) {
      cart {
        ${CART_DETAIL_FIELDS}
      }
      errors {
        code
        message
      }
    }
  }
`;

export const REMOVE_CART_ITEM_MUTATION = `
  mutation RemoveCartItemMutation($cartId: String!, $cartItemUid: ID!) {
    removeItemFromCart(input: { cart_id: $cartId, cart_item_uid: $cartItemUid }) {
      cart {
        ${CART_DETAIL_FIELDS}
      }
    }
  }
`;

export const APPLY_COUPON_TO_CART_MUTATION = `
  mutation ApplyCouponToCartMutation($cartId: String!, $couponCode: String!) {
    applyCouponToCart(input: { cart_id: $cartId, coupon_code: $couponCode }) {
      cart {
        ${CART_DETAIL_FIELDS}
      }
    }
  }
`;

export const REMOVE_COUPON_FROM_CART_MUTATION = `
  mutation RemoveCouponFromCartMutation($cartId: String!) {
    removeCouponFromCart(input: { cart_id: $cartId }) {
      cart {
        ${CART_DETAIL_FIELDS}
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
    estimateShippingMethods(input: { cart_id: $cartId, address: $address }) {
      ${AVAILABLE_SHIPPING_METHOD_FIELDS}
    }
  }
`;

export const SET_SHIPPING_METHOD_ON_CART_MUTATION = `
  mutation SetShippingMethodOnCartMutation($cartId: String!, $carrierCode: String!, $methodCode: String!) {
    setShippingMethodsOnCart(input: { cart_id: $cartId, shipping_methods: [{ carrier_code: $carrierCode, method_code: $methodCode }] }) {
      cart {
        ${CART_DETAIL_FIELDS}
      }
    }
  }
`;

export const SET_GUEST_EMAIL_ON_CART_MUTATION = `
  mutation SetGuestEmailOnCartMutation($cartId: String!, $email: String!) {
    setGuestEmailOnCart(input: { cart_id: $cartId, email: $email }) {
      cart {
        ${CART_DETAIL_FIELDS}
      }
    }
  }
`;

export const SET_SHIPPING_ADDRESS_ON_CART_MUTATION = `
  mutation SetShippingAddressOnCartMutation($cartId: String!, $shippingAddress: ShippingAddressInput!) {
    setShippingAddressesOnCart(input: { cart_id: $cartId, shipping_addresses: [$shippingAddress] }) {
      cart {
        ${CART_DETAIL_FIELDS}
      }
    }
  }
`;

export const SET_BILLING_ADDRESS_ON_CART_MUTATION = `
  mutation SetBillingAddressOnCartMutation($cartId: String!, $billingAddress: BillingAddressInput!) {
    setBillingAddressOnCart(input: { cart_id: $cartId, billing_address: $billingAddress }) {
      cart {
        ${CART_DETAIL_FIELDS}
      }
    }
  }
`;

export const SET_PAYMENT_METHOD_ON_CART_MUTATION = `
  mutation SetPaymentMethodOnCartMutation($cartId: String!, $paymentMethod: PaymentMethodInput!) {
    setPaymentMethodOnCart(input: { cart_id: $cartId, payment_method: $paymentMethod }) {
      cart {
        ${CART_DETAIL_FIELDS}
      }
    }
  }
`;

export const PLACE_ORDER_MUTATION = `
  mutation PlaceOrderMutation($cartId: String!) {
    placeOrder(input: { cart_id: $cartId }) {
      order {
        order_number
      }
      orderV2 {
        number
      }
      errors {
        code
        message
      }
    }
  }
`;
