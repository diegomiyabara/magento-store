import {
  createCustomerDashboardModel,
  createCustomerOrderModel,
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
  CHANGE_CUSTOMER_PASSWORD_MUTATION,
  CREATE_CUSTOMER_ADDRESS_MUTATION,
  COUNTRY_QUERY,
  CUSTOMER_DASHBOARD_QUERY,
  CUSTOMER_ORDER_DETAILS_QUERY,
  CUSTOMER_ORDERS_QUERY,
  CUSTOMER_PROFILE_QUERY,
  CREATE_CUSTOMER_MUTATION,
  DELETE_CUSTOMER_ADDRESS_MUTATION,
  GENERATE_CUSTOMER_TOKEN_MUTATION,
  HOME_BOOTSTRAP_QUERY,
  NAVIGATION_QUERY,
  PRODUCT_BY_URL_KEY_QUERY,
  STORE_CONFIG_QUERY,
  UPDATE_CUSTOMER_ADDRESS_MUTATION,
  UPDATE_CUSTOMER_EMAIL_MUTATION,
  UPDATE_CUSTOMER_MUTATION,
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

    async getCountryRegions(countryCode, signal) {
      const data = await executeMagentoQuery(
        COUNTRY_QUERY,
        { id: countryCode },
        { signal },
      );

      return (data.country?.available_regions ?? []).map((region) => ({
        code: region?.code || '',
        id: region?.id ?? null,
        name: region?.name || '',
      }));
    },

    async getCustomerDashboard(token, signal) {
      const data = await executeMagentoQuery(
        CUSTOMER_DASHBOARD_QUERY,
        {},
        { authToken: token, signal, skipCache: true },
      );

      return createCustomerDashboardModel(data.customer);
    },

    async updateCustomer(token, input, signal) {
      const data = await executeMagentoQuery(
        UPDATE_CUSTOMER_MUTATION,
        { input },
        { authToken: token, signal, skipCache: true },
      );

      return createCustomerModel(data.updateCustomerV2?.customer ?? null);
    },

    async updateCustomerEmail(token, payload, signal) {
      const data = await executeMagentoQuery(
        UPDATE_CUSTOMER_EMAIL_MUTATION,
        payload,
        { authToken: token, signal, skipCache: true },
      );

      return createCustomerModel(data.updateCustomerEmail?.customer ?? null);
    },

    async changeCustomerPassword(token, payload, signal) {
      const data = await executeMagentoQuery(
        CHANGE_CUSTOMER_PASSWORD_MUTATION,
        payload,
        { authToken: token, signal, skipCache: true },
      );

      return createCustomerModel(data.changeCustomerPassword ?? null);
    },

    async createCustomerAddress(token, input, signal) {
      const data = await executeMagentoQuery(
        CREATE_CUSTOMER_ADDRESS_MUTATION,
        { input },
        { authToken: token, signal, skipCache: true },
      );

      return data.createCustomerAddress;
    },

    async updateCustomerAddress(token, addressId, input, signal) {
      const data = await executeMagentoQuery(
        UPDATE_CUSTOMER_ADDRESS_MUTATION,
        { id: Number(addressId), input },
        { authToken: token, signal, skipCache: true },
      );

      return data.updateCustomerAddress;
    },

    async deleteCustomerAddress(token, addressId, signal) {
      const data = await executeMagentoQuery(
        DELETE_CUSTOMER_ADDRESS_MUTATION,
        { id: Number(addressId) },
        { authToken: token, signal, skipCache: true },
      );

      return Boolean(data.deleteCustomerAddress);
    },

    async getCustomerOrders(token, signal) {
      const data = await executeMagentoQuery(
        CUSTOMER_ORDERS_QUERY,
        {},
        { authToken: token, signal, skipCache: true },
      );

      return {
        orders: (data.customer?.orders?.items ?? []).map(createCustomerOrderModel),
        totalCount: data.customer?.orders?.total_count ?? 0,
      };
    },

    async getCustomerOrderByNumber(token, orderNumber, signal) {
      const data = await executeMagentoQuery(
        CUSTOMER_ORDER_DETAILS_QUERY,
        { orderNumber },
        { authToken: token, signal, skipCache: true },
      );

      return createCustomerOrderModel(data.customer?.orders?.items?.[0] ?? null);
    },
  };
}
