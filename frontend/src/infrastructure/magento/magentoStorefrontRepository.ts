import {
  createCartModel,
  createCustomerDashboardModel,
  createCustomerOrderModel,
  createCategoryModel,
  createCmsPageModel,
  createCustomerModel,
  createProductModel,
  createStoreConfigModel,
  CartModel,
  CategoryModel,
  CmsPageModel,
  CustomerDashboardModel,
  CustomerModel,
  CustomerOrderModel,
  ProductModel,
  StoreConfigModel,
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
} from './queries/index';

type RawData = Record<string, unknown>;

export interface ShippingMethodResult {
  carrierCode: string;
  methodCode: string;
  carrierTitle: string;
  methodTitle: string;
  price: number;
  currency: string;
  errorMessage: string;
  available: boolean;
}

export interface RegionResult {
  code: string;
  id: number | null;
  name: string;
}

export interface StorefrontShellResult {
  storeConfig: StoreConfigModel | null;
  navigation: Array<CategoryModel | null>;
}

export interface HomePageResult {
  cmsPage: CmsPageModel | null;
  featuredProducts: Array<ProductModel | null>;
}

export interface CategoryPageResult {
  category: CategoryModel | null;
  products: Array<ProductModel | null>;
  totalCount: number;
  totalPages: number;
}

export interface PlaceOrderResult {
  number: string;
  raw: RawData;
}

export interface CustomerOrdersResult {
  orders: Array<CustomerOrderModel | null>;
  totalCount: number;
}

export interface PaginationOptions {
  currentPage?: number;
  sort?: Record<string, string>;
}

export function createMagentoStorefrontRepository() {
  return {
    async getStorefrontShell(signal?: AbortSignal): Promise<StorefrontShellResult> {
      const storeConfigData = await executeMagentoQuery<RawData>(STORE_CONFIG_QUERY, {}, { signal });
      const storeConfig = createStoreConfigModel(storeConfigData['storeConfig'] as RawData | null);

      const navigationData = storeConfig?.rootCategoryId
        ? await executeMagentoQuery<RawData>(
            NAVIGATION_QUERY,
            { parentId: String(storeConfig.rootCategoryId) },
            { signal },
          )
        : { categoryList: [] as unknown[] };

      return {
        storeConfig,
        navigation: ((navigationData['categoryList'] as unknown[]) ?? []).map((c) =>
          createCategoryModel(c as RawData),
        ),
      };
    },

    async getHomePage(identifier = 'home', signal?: AbortSignal): Promise<HomePageResult> {
      const data = await executeMagentoQuery<RawData>(
        HOME_BOOTSTRAP_QUERY,
        { identifier },
        { signal },
      );

      return {
        cmsPage: createCmsPageModel(data['cmsPage'] as RawData | null),
        featuredProducts: (
          ((data['products'] as RawData | null)?.[
            'items'
          ] as unknown[] | null) ?? []
        ).map((p) => createProductModel(p as RawData)),
      };
    },

    async getCategoryByUrlKey(
      urlKey: string,
      pagination: PaginationOptions = {},
      signal?: AbortSignal,
    ): Promise<CategoryPageResult> {
      const { currentPage = 1, sort = { name: 'ASC' } } = pagination;

      const categoryData = await executeMagentoQuery<RawData>(
        CATEGORY_BY_URL_KEY_QUERY,
        { urlKey },
        { signal },
      );
      const category = createCategoryModel(
        ((categoryData['categoryList'] as unknown[] | null)?.[0] as RawData) ?? null,
      );

      if (!category?.id) {
        return { category: null, products: [], totalCount: 0, totalPages: 0 };
      }

      const productsData = await executeMagentoQuery<RawData>(
        CATEGORY_PRODUCTS_QUERY,
        { categoryId: String(category.id), currentPage, sort, pageSize: 24 },
        { signal },
      );

      const pageInfo = (productsData['products'] as RawData | null)?.['page_info'] as RawData | null ?? {};

      return {
        category,
        products: (
          ((productsData['products'] as RawData | null)?.['items'] as unknown[] | null) ?? []
        ).map((p) => createProductModel(p as RawData)),
        totalCount: ((productsData['products'] as RawData | null)?.['total_count'] as number | null) ?? 0,
        totalPages: (pageInfo['total_pages'] as number | null) ?? 1,
      };
    },

    async getProductByUrlKey(
      urlKey: string,
      signal?: AbortSignal,
    ): Promise<ProductModel | null> {
      const data = await executeMagentoQuery<RawData>(
        PRODUCT_BY_URL_KEY_QUERY,
        { urlKey },
        { signal },
      );

      return createProductModel(
        ((data['products'] as RawData | null)?.['items'] as unknown[] | null)?.[0] as RawData | null ?? null,
      );
    },

    async getGuestCart(cartId: string, signal?: AbortSignal): Promise<CartModel | null> {
      const data = await executeMagentoQuery<RawData>(
        GUEST_CART_QUERY,
        { cartId },
        { signal, skipCache: true },
      );

      return createCartModel(data['cart'] as RawData | null);
    },

    async getCustomerCart(token: string, signal?: AbortSignal): Promise<CartModel | null> {
      const data = await executeMagentoQuery<RawData>(
        CUSTOMER_CART_QUERY,
        {},
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(data['customerCart'] as RawData | null);
    },

    async createGuestCart(signal?: AbortSignal): Promise<CartModel | null> {
      const data = await executeMagentoQuery<RawData>(
        CREATE_GUEST_CART_MUTATION,
        {},
        { signal, skipCache: true },
      );

      return createCartModel(
        ((data['createGuestCart'] as RawData | null)?.['cart'] as RawData | null) ?? null,
      );
    },

    async addProductsToCart(
      cartId: string,
      cartItems: unknown,
      token: string | undefined,
      signal?: AbortSignal,
    ): Promise<CartModel | null> {
      const data = await executeMagentoQuery<RawData>(
        ADD_PRODUCTS_TO_CART_MUTATION,
        { cartId, cartItems },
        { authToken: token, signal, skipCache: true },
      );

      const userErrors = (data['addProductsToCart'] as RawData | null)?.['user_errors'] as
        | Array<{ message?: string }>
        | null;
      const userError = userErrors?.[0];

      if (userError?.message) {
        throw new Error(userError.message);
      }

      return createCartModel(
        ((data['addProductsToCart'] as RawData | null)?.['cart'] as RawData | null) ?? null,
      );
    },

    async updateCartItem(
      cartId: string,
      cartItemUid: string,
      quantity: number,
      token: string | undefined,
      signal?: AbortSignal,
    ): Promise<CartModel | null> {
      const data = await executeMagentoQuery<RawData>(
        UPDATE_CART_ITEM_MUTATION,
        { cartId, cartItemUid, quantity },
        { authToken: token, signal, skipCache: true },
      );

      const errors = (data['updateCartItems'] as RawData | null)?.['errors'] as
        | Array<{ message?: string }>
        | null;
      const userError = errors?.[0];

      if (userError?.message) {
        throw new Error(userError.message);
      }

      return createCartModel(
        ((data['updateCartItems'] as RawData | null)?.['cart'] as RawData | null) ?? null,
      );
    },

    async removeCartItem(
      cartId: string,
      cartItemUid: string,
      token: string | undefined,
      signal?: AbortSignal,
    ): Promise<CartModel | null> {
      const data = await executeMagentoQuery<RawData>(
        REMOVE_CART_ITEM_MUTATION,
        { cartId, cartItemUid },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(
        ((data['removeItemFromCart'] as RawData | null)?.['cart'] as RawData | null) ?? null,
      );
    },

    async applyCouponToCart(
      cartId: string,
      couponCode: string,
      token: string | undefined,
      signal?: AbortSignal,
    ): Promise<CartModel | null> {
      const data = await executeMagentoQuery<RawData>(
        APPLY_COUPON_TO_CART_MUTATION,
        { cartId, couponCode },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(
        ((data['applyCouponToCart'] as RawData | null)?.['cart'] as RawData | null) ?? null,
      );
    },

    async removeCouponFromCart(
      cartId: string,
      token: string | undefined,
      signal?: AbortSignal,
    ): Promise<CartModel | null> {
      const data = await executeMagentoQuery<RawData>(
        REMOVE_COUPON_FROM_CART_MUTATION,
        { cartId },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(
        ((data['removeCouponFromCart'] as RawData | null)?.['cart'] as RawData | null) ?? null,
      );
    },

    async estimateShippingMethods(
      cartId: string,
      address: unknown,
      token: string | undefined,
      signal?: AbortSignal,
    ): Promise<ShippingMethodResult[]> {
      const data = await executeMagentoQuery<RawData>(
        ESTIMATE_SHIPPING_METHODS_MUTATION,
        { cartId, address },
        { authToken: token, signal, skipCache: true },
      );

      return ((data['estimateShippingMethods'] as unknown[] | null) ?? []).map((method) => {
        const m = method as RawData;
        const amount = (m['amount'] as RawData | null) ?? {};
        return {
          carrierCode: (m['carrier_code'] as string) || '',
          methodCode: (m['method_code'] as string) || '',
          carrierTitle: (m['carrier_title'] as string) || '',
          methodTitle: (m['method_title'] as string) || '',
          price: (amount['value'] as number) ?? 0,
          currency: (amount['currency'] as string) || 'BRL',
          errorMessage: (m['error_message'] as string) || '',
          available: Boolean(m['available']),
        };
      });
    },

    async setShippingMethodOnCart(
      cartId: string,
      carrierCode: string,
      methodCode: string,
      token: string | undefined,
      signal?: AbortSignal,
    ): Promise<CartModel | null> {
      const data = await executeMagentoQuery<RawData>(
        SET_SHIPPING_METHOD_ON_CART_MUTATION,
        { cartId, carrierCode, methodCode },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(
        ((data['setShippingMethodsOnCart'] as RawData | null)?.['cart'] as RawData | null) ?? null,
      );
    },

    async setGuestEmailOnCart(
      cartId: string,
      email: string,
      token: string | undefined,
      signal?: AbortSignal,
    ): Promise<CartModel | null> {
      const data = await executeMagentoQuery<RawData>(
        SET_GUEST_EMAIL_ON_CART_MUTATION,
        { cartId, email },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(
        ((data['setGuestEmailOnCart'] as RawData | null)?.['cart'] as RawData | null) ?? null,
      );
    },

    async setShippingAddressOnCart(
      cartId: string,
      shippingAddress: unknown,
      token: string | undefined,
      signal?: AbortSignal,
    ): Promise<CartModel | null> {
      const data = await executeMagentoQuery<RawData>(
        SET_SHIPPING_ADDRESS_ON_CART_MUTATION,
        { cartId, shippingAddress },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(
        ((data['setShippingAddressesOnCart'] as RawData | null)?.['cart'] as RawData | null) ?? null,
      );
    },

    async setBillingAddressOnCart(
      cartId: string,
      billingAddress: unknown,
      token: string | undefined,
      signal?: AbortSignal,
    ): Promise<CartModel | null> {
      const data = await executeMagentoQuery<RawData>(
        SET_BILLING_ADDRESS_ON_CART_MUTATION,
        { cartId, billingAddress },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(
        ((data['setBillingAddressOnCart'] as RawData | null)?.['cart'] as RawData | null) ?? null,
      );
    },

    async setPaymentMethodOnCart(
      cartId: string,
      paymentMethod: unknown,
      token: string | undefined,
      signal?: AbortSignal,
    ): Promise<CartModel | null> {
      const data = await executeMagentoQuery<RawData>(
        SET_PAYMENT_METHOD_ON_CART_MUTATION,
        { cartId, paymentMethod },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel(
        ((data['setPaymentMethodOnCart'] as RawData | null)?.['cart'] as RawData | null) ?? null,
      );
    },

    async placeOrder(
      cartId: string,
      token: string | undefined,
      signal?: AbortSignal,
    ): Promise<PlaceOrderResult> {
      const data = await executeMagentoQuery<RawData>(
        PLACE_ORDER_MUTATION,
        { cartId },
        { authToken: token, signal, skipCache: true },
      );

      const placeOrder = (data['placeOrder'] as RawData | null) ?? {};
      const orderErrors = placeOrder['errors'] as Array<{ message?: string }> | null;
      const orderError = orderErrors?.[0];

      if (orderError?.message) {
        throw new Error(orderError.message);
      }

      const orderV2 = placeOrder['orderV2'] as RawData | null;
      const order = placeOrder['order'] as RawData | null;

      return {
        number:
          (orderV2?.['number'] as string) ||
          (order?.['order_number'] as string) ||
          '',
        raw: placeOrder,
      };
    },

    async mergeCarts(
      token: string,
      sourceCartId: string,
      signal?: AbortSignal,
    ): Promise<CartModel | null> {
      const data = await executeMagentoQuery<RawData>(
        MERGE_CARTS_MUTATION,
        { sourceCartId },
        { authToken: token, signal, skipCache: true },
      );

      return createCartModel((data['mergeCarts'] as RawData | null) ?? null);
    },

    async loginCustomer(
      credentials: Record<string, unknown>,
      signal?: AbortSignal,
    ): Promise<string | null> {
      const data = await executeMagentoQuery<RawData>(
        GENERATE_CUSTOMER_TOKEN_MUTATION,
        credentials,
        { signal, skipCache: true },
      );

      return (
        ((data['generateCustomerToken'] as RawData | null)?.['token'] as string | null) ?? null
      );
    },

    async registerCustomer(
      input: Record<string, unknown>,
      signal?: AbortSignal,
    ): Promise<CustomerModel | null> {
      const data = await executeMagentoQuery<RawData>(
        CREATE_CUSTOMER_MUTATION,
        { input },
        { signal, skipCache: true },
      );

      return createCustomerModel(
        ((data['createCustomerV2'] as RawData | null)?.['customer'] as RawData | null) ?? null,
      );
    },

    async getCustomerProfile(
      token: string,
      signal?: AbortSignal,
    ): Promise<CustomerModel | null> {
      const data = await executeMagentoQuery<RawData>(
        CUSTOMER_PROFILE_QUERY,
        {},
        { authToken: token, signal, skipCache: true },
      );

      return createCustomerModel(data['customer'] as RawData | null);
    },

    async getCountryRegions(
      countryCode: string,
      signal?: AbortSignal,
    ): Promise<RegionResult[]> {
      const data = await executeMagentoQuery<RawData>(
        COUNTRY_QUERY,
        { id: countryCode },
        { signal },
      );

      return (
        ((data['country'] as RawData | null)?.['available_regions'] as
          | Array<RawData | null>
          | null) ?? []
      ).map((region) => ({
        code: (region?.['code'] as string) || '',
        id: (region?.['id'] as number | null) ?? null,
        name: (region?.['name'] as string) || '',
      }));
    },

    async getCustomerDashboard(
      token: string,
      signal?: AbortSignal,
    ): Promise<CustomerDashboardModel | null> {
      const data = await executeMagentoQuery<RawData>(
        CUSTOMER_DASHBOARD_QUERY,
        {},
        { authToken: token, signal, skipCache: true },
      );

      return createCustomerDashboardModel(data['customer'] as RawData | null);
    },

    async updateCustomer(
      token: string,
      input: Record<string, unknown>,
      signal?: AbortSignal,
    ): Promise<CustomerModel | null> {
      const data = await executeMagentoQuery<RawData>(
        UPDATE_CUSTOMER_MUTATION,
        { input },
        { authToken: token, signal, skipCache: true },
      );

      return createCustomerModel(
        ((data['updateCustomerV2'] as RawData | null)?.['customer'] as RawData | null) ?? null,
      );
    },

    async updateCustomerEmail(
      token: string,
      payload: Record<string, unknown>,
      signal?: AbortSignal,
    ): Promise<CustomerModel | null> {
      const data = await executeMagentoQuery<RawData>(
        UPDATE_CUSTOMER_EMAIL_MUTATION,
        payload,
        { authToken: token, signal, skipCache: true },
      );

      return createCustomerModel(
        ((data['updateCustomerEmail'] as RawData | null)?.['customer'] as RawData | null) ?? null,
      );
    },

    async changeCustomerPassword(
      token: string,
      payload: Record<string, unknown>,
      signal?: AbortSignal,
    ): Promise<CustomerModel | null> {
      const data = await executeMagentoQuery<RawData>(
        CHANGE_CUSTOMER_PASSWORD_MUTATION,
        payload,
        { authToken: token, signal, skipCache: true },
      );

      return createCustomerModel((data['changeCustomerPassword'] as RawData | null) ?? null);
    },

    async createCustomerAddress(
      token: string,
      input: Record<string, unknown>,
      signal?: AbortSignal,
    ): Promise<RawData | null> {
      const data = await executeMagentoQuery<RawData>(
        CREATE_CUSTOMER_ADDRESS_MUTATION,
        { input },
        { authToken: token, signal, skipCache: true },
      );

      return (data['createCustomerAddress'] as RawData | null) ?? null;
    },

    async updateCustomerAddress(
      token: string,
      addressId: string | number,
      input: Record<string, unknown>,
      signal?: AbortSignal,
    ): Promise<RawData | null> {
      const data = await executeMagentoQuery<RawData>(
        UPDATE_CUSTOMER_ADDRESS_MUTATION,
        { id: Number(addressId), input },
        { authToken: token, signal, skipCache: true },
      );

      return (data['updateCustomerAddress'] as RawData | null) ?? null;
    },

    async deleteCustomerAddress(
      token: string,
      addressId: string | number,
      signal?: AbortSignal,
    ): Promise<boolean> {
      const data = await executeMagentoQuery<RawData>(
        DELETE_CUSTOMER_ADDRESS_MUTATION,
        { id: Number(addressId) },
        { authToken: token, signal, skipCache: true },
      );

      return Boolean(data['deleteCustomerAddress']);
    },

    async getCustomerOrders(
      token: string,
      signal?: AbortSignal,
    ): Promise<CustomerOrdersResult> {
      const data = await executeMagentoQuery<RawData>(
        CUSTOMER_ORDERS_QUERY,
        {},
        { authToken: token, signal, skipCache: true },
      );

      const customer = (data['customer'] as RawData | null) ?? {};
      const orders = (customer['orders'] as RawData | null) ?? {};

      return {
        orders: ((orders['items'] as unknown[] | null) ?? []).map((o) =>
          createCustomerOrderModel(o as RawData),
        ),
        totalCount: (orders['total_count'] as number | null) ?? 0,
      };
    },

    async getCustomerOrderByNumber(
      token: string,
      orderNumber: string,
      signal?: AbortSignal,
    ): Promise<CustomerOrderModel | null> {
      const data = await executeMagentoQuery<RawData>(
        CUSTOMER_ORDER_DETAILS_QUERY,
        { orderNumber },
        { authToken: token, signal, skipCache: true },
      );

      const customer = (data['customer'] as RawData | null) ?? {};
      const orders = (customer['orders'] as RawData | null) ?? {};
      const items = (orders['items'] as unknown[] | null) ?? [];

      return createCustomerOrderModel((items[0] as RawData | null) ?? null);
    },
  };
}
