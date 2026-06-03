export const apiConfig = {
  graphqlUrl: import.meta.env.VITE_MAGENTO_GRAPHQL_URL || '/graphql',
  mediaBaseUrl: import.meta.env.VITE_MAGENTO_MEDIA_BASE_URL || '',
  storeCode: import.meta.env.VITE_STORE_CODE || 'default',
};
