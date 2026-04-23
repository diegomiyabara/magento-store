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
      firstname
      lastname
      email
    }
  }
`;

export const CUSTOMER_DASHBOARD_QUERY = `
  query CustomerDashboardQuery {
    customer {
      firstname
      lastname
      email
      is_subscribed
      addresses {
        id
        firstname
        lastname
        street
        city
        postcode
        telephone
        country_code
        default_shipping
        default_billing
        region {
          region
        }
      }
      orders(pageSize: 5, currentPage: 1) {
        total_count
        items {
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
        }
      }
    }
  }
`;
