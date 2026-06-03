import type { createMagentoStorefrontRepository } from '@/infrastructure/magento/magentoStorefrontRepository';

type StorefrontRepository = ReturnType<typeof createMagentoStorefrontRepository>;

export function createStorefrontUseCases(repository: StorefrontRepository) {
  return {
    getShell(signal?: AbortSignal) {
      return repository.getStorefrontShell(signal);
    },

    getHomePage(signal?: AbortSignal) {
      return repository.getHomePage('home', signal);
    },

    getCategoryPage(urlKey: string, pagination: { currentPage?: number; sort?: Record<string, string> }, signal?: AbortSignal) {
      return repository.getCategoryByUrlKey(urlKey, pagination, signal);
    },

    getProductPage(urlKey: string, signal?: AbortSignal) {
      return repository.getProductByUrlKey(urlKey, signal);
    },

    getGuestCart(cartId: string, signal?: AbortSignal) {
      return repository.getGuestCart(cartId, signal);
    },

    getCustomerCart(token: string, signal?: AbortSignal) {
      return repository.getCustomerCart(token, signal);
    },

    createGuestCart(signal?: AbortSignal) {
      return repository.createGuestCart(signal);
    },

    addProductsToCart(cartId: string, cartItems: unknown, token: string | undefined, signal?: AbortSignal) {
      return repository.addProductsToCart(cartId, cartItems, token, signal);
    },

    updateCartItem(cartId: string, cartItemId: string, quantity: number, token: string | undefined, signal?: AbortSignal) {
      return repository.updateCartItem(cartId, cartItemId, quantity, token, signal);
    },

    removeCartItem(cartId: string, cartItemId: string, token: string | undefined, signal?: AbortSignal) {
      return repository.removeCartItem(cartId, cartItemId, token, signal);
    },

    applyCouponToCart(cartId: string, couponCode: string, token: string | undefined, signal?: AbortSignal) {
      return repository.applyCouponToCart(cartId, couponCode, token, signal);
    },

    removeCouponFromCart(cartId: string, token: string | undefined, signal?: AbortSignal) {
      return repository.removeCouponFromCart(cartId, token, signal);
    },

    estimateShippingMethods(cartId: string, address: unknown, token: string | undefined, signal?: AbortSignal) {
      return repository.estimateShippingMethods(cartId, address, token, signal);
    },

    setShippingMethodOnCart(cartId: string, carrierCode: string, methodCode: string, token: string | undefined, signal?: AbortSignal) {
      return repository.setShippingMethodOnCart(cartId, carrierCode, methodCode, token, signal);
    },

    setGuestEmailOnCart(cartId: string, email: string, token: string | undefined, signal?: AbortSignal) {
      return repository.setGuestEmailOnCart(cartId, email, token, signal);
    },

    setShippingAddressOnCart(cartId: string, shippingAddress: unknown, token: string | undefined, signal?: AbortSignal) {
      return repository.setShippingAddressOnCart(cartId, shippingAddress, token, signal);
    },

    setBillingAddressOnCart(cartId: string, billingAddress: unknown, token: string | undefined, signal?: AbortSignal) {
      return repository.setBillingAddressOnCart(cartId, billingAddress, token, signal);
    },

    setPaymentMethodOnCart(cartId: string, paymentMethod: unknown, token: string | undefined, signal?: AbortSignal) {
      return repository.setPaymentMethodOnCart(cartId, paymentMethod, token, signal);
    },

    placeOrder(cartId: string, token: string | undefined, signal?: AbortSignal) {
      return repository.placeOrder(cartId, token, signal);
    },

    mergeCarts(token: string, sourceCartId: string, signal?: AbortSignal) {
      return repository.mergeCarts(token, sourceCartId, signal);
    },

    loginCustomer(credentials: Record<string, unknown>, signal?: AbortSignal) {
      return repository.loginCustomer(credentials, signal);
    },

    registerCustomer(input: Record<string, unknown>, signal?: AbortSignal) {
      return repository.registerCustomer(input, signal);
    },

    getCustomerProfile(token: string, signal?: AbortSignal) {
      return repository.getCustomerProfile(token, signal);
    },

    getCountryRegions(countryCode: string, signal?: AbortSignal) {
      return repository.getCountryRegions(countryCode, signal);
    },

    getCustomerDashboard(token: string, signal?: AbortSignal) {
      return repository.getCustomerDashboard(token, signal);
    },

    updateCustomer(token: string, input: Record<string, unknown>, signal?: AbortSignal) {
      return repository.updateCustomer(token, input, signal);
    },

    updateCustomerEmail(token: string, payload: Record<string, unknown>, signal?: AbortSignal) {
      return repository.updateCustomerEmail(token, payload, signal);
    },

    changeCustomerPassword(token: string, payload: Record<string, unknown>, signal?: AbortSignal) {
      return repository.changeCustomerPassword(token, payload, signal);
    },

    createCustomerAddress(token: string, input: Record<string, unknown>, signal?: AbortSignal) {
      return repository.createCustomerAddress(token, input, signal);
    },

    updateCustomerAddress(token: string, addressId: string | number, input: Record<string, unknown>, signal?: AbortSignal) {
      return repository.updateCustomerAddress(token, addressId, input, signal);
    },

    deleteCustomerAddress(token: string, addressId: string | number, signal?: AbortSignal) {
      return repository.deleteCustomerAddress(token, addressId, signal);
    },

    getCustomerOrders(token: string, signal?: AbortSignal) {
      return repository.getCustomerOrders(token, signal);
    },

    getCustomerOrderByNumber(token: string, orderNumber: string, signal?: AbortSignal) {
      return repository.getCustomerOrderByNumber(token, orderNumber, signal);
    },
  };
}
