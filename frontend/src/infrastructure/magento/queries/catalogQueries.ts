export const CATEGORY_BY_URL_KEY_QUERY: string = `
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
      breadcrumbs {
        category_id
        category_name
        category_url_key
      }
    }
  }
`;

export const CATEGORY_PRODUCTS_QUERY: string = `
  query CategoryProductsQuery(
    $categoryId: String!
    $pageSize: Int = 24
    $currentPage: Int = 1
    $sort: ProductAttributeSortInput = { name: ASC }
  ) {
    products(
      filter: { category_id: { eq: $categoryId } }
      pageSize: $pageSize
      currentPage: $currentPage
      sort: $sort
    ) {
      total_count
      page_info {
        current_page
        page_size
        total_pages
      }
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

export const PRODUCT_BY_URL_KEY_QUERY: string = `
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
        media_gallery {
          url
          label
          disabled
        }
        categories {
          id
          name
          url_key
          breadcrumbs {
            category_name
            category_url_key
          }
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
