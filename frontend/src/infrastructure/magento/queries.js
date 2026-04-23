export const STORE_CONFIG_QUERY = `
  query StoreConfigQuery {
    storeConfig {
      store_code
      store_name
      base_url
      base_media_url
      secure_base_url
      secure_base_media_url
    }
  }
`;

export const NAVIGATION_QUERY = `
  query NavigationQuery {
    categoryList(filters: { parent_id: { eq: "2" } }) {
      uid
      id
      name
      url_key
      description
      product_count
      meta_title
      meta_description
    }
  }
`;

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

export const CATEGORY_BY_URL_KEY_QUERY = `
  query CategoryByUrlKeyQuery($urlKey: String!) {
    categoryList(filters: { url_key: { eq: $urlKey } }) {
      uid
      id
      name
      url_key
      description
      product_count
      meta_title
      meta_description
    }
  }
`;

export const CATEGORY_PRODUCTS_QUERY = `
  query CategoryProductsQuery($categoryId: String!) {
    products(filter: { category_id: { eq: $categoryId } }, pageSize: 24) {
      total_count
      items {
        uid
        sku
        name
        url_key
        url_suffix
        short_description {
          html
        }
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

export const PRODUCT_BY_URL_KEY_QUERY = `
  query ProductByUrlKeyQuery($urlKey: String!) {
    products(filter: { url_key: { eq: $urlKey } }, pageSize: 1) {
      items {
        uid
        sku
        name
        url_key
        stock_status
        description {
          html
        }
        short_description {
          html
        }
        image {
          url
          label
        }
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
