export const GENERATE_CUSTOMER_TOKEN_MUTATION = `
  mutation GenerateCustomerTokenMutation($email: String!, $password: String!) {
    generateCustomerToken(email: $email, password: $password) {
      token
    }
  }
`;

export const CREATE_CUSTOMER_MUTATION = `
  mutation CreateCustomerMutation($input: CustomerCreateInput!) {
    createCustomerV2(input: $input) {
      customer {
        firstname
        lastname
        email
      }
    }
  }
`;

export const CUSTOMER_PROFILE_QUERY = `
  query CustomerProfileQuery {
    customer {
      created_at
      date_of_birth
      firstname
      gender
      lastname
      email
      prefix
      suffix
      taxvat
    }
  }
`;

const CUSTOMER_ADDRESS_FIELDS = `
  id
  firstname
  lastname
  middlename
  prefix
  suffix
  company
  street
  city
  postcode
  telephone
  fax
  vat_id
  country_code
  default_shipping
  default_billing
  region {
    region
    region_code
    region_id
  }
`;

const CUSTOMER_ORDER_SUMMARY_FIELDS = `
  id
  number
  order_date
  status
  total {
    grand_total {
      value
      currency
    }
  }
`;

export const CUSTOMER_DASHBOARD_QUERY = `
  query CustomerDashboardQuery {
    customer {
      created_at
      date_of_birth
      firstname
      gender
      lastname
      email
      prefix
      suffix
      taxvat
      is_subscribed
      addresses {
        ${CUSTOMER_ADDRESS_FIELDS}
      }
      orders(pageSize: 5, currentPage: 1) {
        total_count
        items {
          ${CUSTOMER_ORDER_SUMMARY_FIELDS}
        }
      }
    }
  }
`;

export const CUSTOMER_ORDERS_QUERY = `
  query CustomerOrdersQuery {
    customer {
      orders(pageSize: 100, currentPage: 1, sort: { sort_field: CREATED_AT, sort_direction: DESC }) {
        total_count
        items {
          ${CUSTOMER_ORDER_SUMMARY_FIELDS}
        }
      }
    }
  }
`;

export const CUSTOMER_ORDER_DETAILS_QUERY = `
  query CustomerOrderDetailsQuery($orderNumber: String!) {
    customer {
      orders(filter: { number: { eq: $orderNumber } }, pageSize: 1, currentPage: 1) {
        total_count
        items {
          id
          number
          order_date
          status
          shipping_method
          carrier
          token
          email
          is_virtual
          order_status_change_date
          available_actions
          applied_coupons {
            code
          }
          customer_info {
            firstname
            lastname
            middlename
            prefix
            suffix
          }
          payment_methods {
            name
            type
            additional_data {
              name
              value
            }
          }
          shipping_address {
            firstname
            lastname
            middlename
            company
            street
            city
            region
            region_id
            postcode
            telephone
            fax
            vat_id
            country_code
          }
          billing_address {
            firstname
            lastname
            middlename
            company
            street
            city
            region
            region_id
            postcode
            telephone
            fax
            vat_id
            country_code
          }
          items {
            id
            product_name
            product_sku
            product_type
            status
            quantity_ordered
            quantity_shipped
            quantity_refunded
            quantity_invoiced
            quantity_canceled
            quantity_returned
            product_sale_price {
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
            selected_options {
              label
              value
            }
            entered_options {
              label
              value
            }
            prices {
              row_total {
                value
                currency
              }
            }
          }
          total {
            subtotal_excl_tax {
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
              amount {
                value
                currency
              }
            }
            shipping_handling {
              total_amount {
                value
                currency
              }
            }
          }
          invoices {
            id
            number
            comments {
              timestamp
              message
            }
            total {
              grand_total {
                value
                currency
              }
            }
            items {
              id
              product_name
              product_sku
              quantity_invoiced
            }
          }
          shipments {
            id
            number
            comments {
              timestamp
              message
            }
            tracking {
              title
              carrier
              number
            }
            items {
              id
              product_name
              product_sku
              quantity_shipped
            }
          }
          comments {
            timestamp
            message
          }
        }
      }
    }
  }
`;

export const UPDATE_CUSTOMER_MUTATION = `
  mutation UpdateCustomerMutation($input: CustomerUpdateInput!) {
    updateCustomerV2(input: $input) {
      customer {
        firstname
        lastname
        email
        is_subscribed
      }
    }
  }
`;

export const UPDATE_CUSTOMER_EMAIL_MUTATION = `
  mutation UpdateCustomerEmailMutation($email: String!, $password: String!) {
    updateCustomerEmail(email: $email, password: $password) {
      customer {
        firstname
        lastname
        email
      }
    }
  }
`;

export const CHANGE_CUSTOMER_PASSWORD_MUTATION = `
  mutation ChangeCustomerPasswordMutation($currentPassword: String!, $newPassword: String!) {
    changeCustomerPassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      firstname
      lastname
      email
    }
  }
`;

export const CREATE_CUSTOMER_ADDRESS_MUTATION = `
  mutation CreateCustomerAddressMutation($input: CustomerAddressInput!) {
    createCustomerAddress(input: $input) {
      ${CUSTOMER_ADDRESS_FIELDS}
    }
  }
`;

export const UPDATE_CUSTOMER_ADDRESS_MUTATION = `
  mutation UpdateCustomerAddressMutation($id: Int!, $input: CustomerAddressInput!) {
    updateCustomerAddress(id: $id, input: $input) {
      ${CUSTOMER_ADDRESS_FIELDS}
    }
  }
`;

export const DELETE_CUSTOMER_ADDRESS_MUTATION = `
  mutation DeleteCustomerAddressMutation($id: Int!) {
    deleteCustomerAddress(id: $id)
  }
`;
