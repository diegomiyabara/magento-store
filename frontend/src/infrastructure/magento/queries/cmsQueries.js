export const HOME_BOOTSTRAP_QUERY = `
  query HomeBootstrapQuery($identifier: String!) {
    cmsPage(identifier: $identifier) {
      identifier
      title
      content
      meta_title
      meta_description
    }
    products(search: "", pageSize: 8) {
      items {
        uid
        sku
        name
        url_key
        stock_status
        small_image {
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
    }
  }
`;
