import {
  createCategoryModel,
  createCmsPageModel,
  createCustomerModel,
  createProductModel,
  createStoreConfigModel,
} from '../../domain/storefront/models';
import { executeMagentoQuery } from './magentoClient';
import {
  CATEGORY_BY_URL_KEY_QUERY,
  CATEGORY_PRODUCTS_QUERY,
  CUSTOMER_PROFILE_QUERY,
  CREATE_CUSTOMER_MUTATION,
  GENERATE_CUSTOMER_TOKEN_MUTATION,
  HOME_BOOTSTRAP_QUERY,
  NAVIGATION_QUERY,
  PRODUCT_BY_URL_KEY_QUERY,
  STORE_CONFIG_QUERY,
} from './queries';

export function createMagentoStorefrontRepository() {
  return {
    async getStorefrontShell(signal) {
      const storeConfigData = await executeMagentoQuery(STORE_CONFIG_QUERY, {}, { signal });
      const storeConfig = createStoreConfigModel(storeConfigData.storeConfig);

      const navigationData = storeConfig?.rootCategoryId
        ? await executeMagentoQuery(
            NAVIGATION_QUERY,
            { parentId: String(storeConfig.rootCategoryId) },
            { signal },
          )
        : { categoryList: [] };

      return {
        storeConfig,
        navigation: (navigationData.categoryList ?? []).map(createCategoryModel),
      };
    },

    async getHomePage(identifier = 'home', signal) {
      const data = await executeMagentoQuery(
        HOME_BOOTSTRAP_QUERY,
        { identifier },
        { signal },
      );

      return {
        cmsPage: createCmsPageModel(data.cmsPage),
        featuredProducts: (data.products?.items ?? []).map(createProductModel),
      };
    },

    async getCategoryByUrlKey(urlKey, signal) {
      const categoryData = await executeMagentoQuery(
        CATEGORY_BY_URL_KEY_QUERY,
        { urlKey },
        { signal },
      );
      const category = createCategoryModel(categoryData.categoryList?.[0] ?? null);

      if (!category?.id) {
        return {
          category: null,
          products: [],
          totalCount: 0,
        };
      }

      const productsData = await executeMagentoQuery(
        CATEGORY_PRODUCTS_QUERY,
        { categoryId: String(category.id) },
        { signal },
      );

      return {
        category,
        products: (productsData.products?.items ?? []).map(createProductModel),
        totalCount: productsData.products?.total_count ?? 0,
      };
    },

    async getProductByUrlKey(urlKey, signal) {
      const data = await executeMagentoQuery(
        PRODUCT_BY_URL_KEY_QUERY,
        { urlKey },
        { signal },
      );

      return createProductModel(data.products?.items?.[0] ?? null);
    },

    async loginCustomer(credentials, signal) {
      const data = await executeMagentoQuery(
        GENERATE_CUSTOMER_TOKEN_MUTATION,
        credentials,
        { signal, skipCache: true },
      );

      return data.generateCustomerToken?.token ?? null;
    },

    async registerCustomer(input, signal) {
      const data = await executeMagentoQuery(
        CREATE_CUSTOMER_MUTATION,
        { input },
        { signal, skipCache: true },
      );

      return createCustomerModel(data.createCustomerV2?.customer ?? null);
    },

    async getCustomerProfile(token, signal) {
      const data = await executeMagentoQuery(
        CUSTOMER_PROFILE_QUERY,
        {},
        { authToken: token, signal, skipCache: true },
      );

      return createCustomerModel(data.customer);
    },
  };
}
