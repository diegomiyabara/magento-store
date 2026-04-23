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
