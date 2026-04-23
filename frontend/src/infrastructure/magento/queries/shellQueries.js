export const STORE_CONFIG_QUERY = `
  query StoreConfigQuery {
    storeConfig {
      store_code
      store_name
      root_category_id
      root_category_uid
      base_url
      base_media_url
      secure_base_url
      secure_base_media_url
    }
  }
`;

export const NAVIGATION_QUERY = `
  query NavigationQuery($parentId: String!) {
    categoryList(filters: { parent_id: { eq: $parentId } }) {
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
