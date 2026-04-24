import {
  createCartModel,
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
  ADD_PRODUCTS_TO_CART_MUTATION,
  APPLY_COUPON_TO_CART_MUTATION,
  CATEGORY_BY_URL_KEY_QUERY,
  CATEGORY_PRODUCTS_QUERY,
  CHANGE_CUSTOMER_PASSWORD_MUTATION,
  CREATE_GUEST_CART_MUTATION,
  CREATE_CUSTOMER_ADDRESS_MUTATION,
  COUNTRY_QUERY,
  CUSTOMER_CART_QUERY,
  CUSTOMER_DASHBOARD_QUERY,
  CUSTOMER_ORDER_DETAILS_QUERY,
  CUSTOMER_ORDERS_QUERY,
  CUSTOMER_PROFILE_QUERY,
  CREATE_CUSTOMER_MUTATION,
  DELETE_CUSTOMER_ADDRESS_MUTATION,
  ESTIMATE_SHIPPING_METHODS_MUTATION,
  GENERATE_CUSTOMER_TOKEN_MUTATION,
  GUEST_CART_QUERY,
  HOME_BOOTSTRAP_QUERY,
  MERGE_CARTS_MUTATION,
  NAVIGATION_QUERY,
  PRODUCT_BY_URL_KEY_QUERY,
  REMOVE_CART_ITEM_MUTATION,
  REMOVE_COUPON_FROM_CART_MUTATION,
  PLACE_ORDER_MUTATION,
  SET_GUEST_EMAIL_ON_CART_MUTATION,
  SET_BILLING_ADDRESS_ON_CART_MUTATION,
  SET_PAYMENT_METHOD_ON_CART_MUTATION,
  SET_SHIPPING_ADDRESS_ON_CART_MUTATION,
  SET_SHIPPING_METHOD_ON_CART_MUTATION,
  STORE_CONFIG_QUERY,
  UPDATE_CART_ITEM_MUTATION,
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

    async getGuestCart(cartId, signal) {
      const data = await executeMagentoQuery(
        GUEST_CART_QUERY,
        { cartId },
        { signal, skipCache: true },
      );

      return createCartModel(data.cart);
    },

    async getCustomerCart(token, signal) {
      const data = await executeMagentoQuery(
        CUSTOMER_CART_QUERY,
        {},
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(data.customerCart);
    },

    async createGuestCart(signal) {
      const data = await executeMagentoQuery(
        CREATE_GUEST_CART_MUTATION,
        {},
        { signal, skipCache: true },
      );

      return createCartModel(data.createGuestCart?.cart ?? null);
    },

    async addProductsToCart(cartId, cartItems, token, signal) {
      const data = await executeMagentoQuery(
        ADD_PRODUCTS_TO_CART_MUTATION,
        { cartId, cartItems },
        { authToken: token, signal, skipCache: true },
      );

      const userError = data.addProductsToCart?.user_errors?.[0];

      if (userError?.message) {
        throw new Error(userError.message);
      }

      return createCartModel(data.addProductsToCart?.cart ?? null);
    },

    async updateCartItem(cartId, cartItemUid, quantity, token, signal) {
      const data = await executeMagentoQuery(
        UPDATE_CART_ITEM_MUTATION,
        { cartId, cartItemUid, quantity },
        { authToken: token, signal, skipCache: true },
      );

      const userError = data.updateCartItems?.errors?.[0];

      if (userError?.message) {
        throw new Error(userError.message);
      }

      return createCartModel(data.updateCartItems?.cart ?? null);
    },

    async removeCartItem(cartId, cartItemUid, token, signal) {
      const data = await executeMagentoQuery(
        REMOVE_CART_ITEM_MUTATION,
        { cartId, cartItemUid },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(data.removeItemFromCart?.cart ?? null);
    },

    async applyCouponToCart(cartId, couponCode, token, signal) {
      const data = await executeMagentoQuery(
        APPLY_COUPON_TO_CART_MUTATION,
        { cartId, couponCode },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(data.applyCouponToCart?.cart ?? null);
    },

    async removeCouponFromCart(cartId, token, signal) {
      const data = await executeMagentoQuery(
        REMOVE_COUPON_FROM_CART_MUTATION,
        { cartId },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(data.removeCouponFromCart?.cart ?? null);
    },

    async estimateShippingMethods(cartId, address, token, signal) {
      const data = await executeMagentoQuery(
        ESTIMATE_SHIPPING_METHODS_MUTATION,
        { cartId, address },
        { authToken: token, signal, skipCache: true },
      );

      return (data.estimateShippingMethods ?? []).map((method) => ({
        carrierCode: method.carrier_code || '',
        methodCode: method.method_code || '',
        carrierTitle: method.carrier_title || '',
        methodTitle: method.method_title || '',
        price: method.amount?.value ?? 0,
        currency: method.amount?.currency || 'BRL',
        errorMessage: method.error_message || '',
        available: Boolean(method.available),
      }));
    },

    async setShippingMethodOnCart(cartId, carrierCode, methodCode, token, signal) {
      const data = await executeMagentoQuery(
        SET_SHIPPING_METHOD_ON_CART_MUTATION,
        { cartId, carrierCode, methodCode },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(data.setShippingMethodsOnCart?.cart ?? null);
    },

    async setGuestEmailOnCart(cartId, email, token, signal) {
      const data = await executeMagentoQuery(
        SET_GUEST_EMAIL_ON_CART_MUTATION,
        { cartId, email },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(data.setGuestEmailOnCart?.cart ?? null);
    },

    async setShippingAddressOnCart(cartId, shippingAddress, token, signal) {
      const data = await executeMagentoQuery(
        SET_SHIPPING_ADDRESS_ON_CART_MUTATION,
        { cartId, shippingAddress },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(data.setShippingAddressesOnCart?.cart ?? null);
    },

    async setBillingAddressOnCart(cartId, billingAddress, token, signal) {
      const data = await executeMagentoQuery(
        SET_BILLING_ADDRESS_ON_CART_MUTATION,
        { cartId, billingAddress },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(data.setBillingAddressOnCart?.cart ?? null);
    },

    async setPaymentMethodOnCart(cartId, paymentMethod, token, signal) {
      const data = await executeMagentoQuery(
        SET_PAYMENT_METHOD_ON_CART_MUTATION,
        { cartId, paymentMethod },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(data.setPaymentMethodOnCart?.cart ?? null);
    },

    async placeOrder(cartId, token, signal) {
      const data = await executeMagentoQuery(
        PLACE_ORDER_MUTATION,
        { cartId },
        { authToken: token, signal, skipCache: true },
      );

      const orderError = data.placeOrder?.errors?.[0];

      if (orderError?.message) {
        throw new Error(orderError.message);
      }

      return {
        number: data.placeOrder?.orderV2?.number || data.placeOrder?.order?.order_number || '',
        raw: data.placeOrder,
      };
    },

    async mergeCarts(token, sourceCartId, signal) {
      const data = await executeMagentoQuery(
        MERGE_CARTS_MUTATION,
        { sourceCartId },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(data.mergeCarts ?? null);
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
