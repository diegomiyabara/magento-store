export function createStorefrontUseCases(repository) {
  return {
    getShell(signal) {
      return repository.getStorefrontShell(signal);
    },

    getHomePage(signal) {
      return repository.getHomePage('home', signal);
    },

    getCategoryPage(urlKey, signal) {
      return repository.getCategoryByUrlKey(urlKey, signal);
    },

    getProductPage(urlKey, signal) {
      return repository.getProductByUrlKey(urlKey, signal);
    },

    loginCustomer(credentials, signal) {
      return repository.loginCustomer(credentials, signal);
    },

    registerCustomer(input, signal) {
      return repository.registerCustomer(input, signal);
    },

    getCustomerProfile(token, signal) {
      return repository.getCustomerProfile(token, signal);
    },

    getCountryRegions(countryCode, signal) {
      return repository.getCountryRegions(countryCode, signal);
    },

    getCustomerDashboard(token, signal) {
      return repository.getCustomerDashboard(token, signal);
    },

    updateCustomer(token, input, signal) {
      return repository.updateCustomer(token, input, signal);
    },

    updateCustomerEmail(token, payload, signal) {
      return repository.updateCustomerEmail(token, payload, signal);
    },

    changeCustomerPassword(token, payload, signal) {
      return repository.changeCustomerPassword(token, payload, signal);
    },

    createCustomerAddress(token, input, signal) {
      return repository.createCustomerAddress(token, input, signal);
    },

    updateCustomerAddress(token, addressId, input, signal) {
      return repository.updateCustomerAddress(token, addressId, input, signal);
    },

    deleteCustomerAddress(token, addressId, signal) {
      return repository.deleteCustomerAddress(token, addressId, signal);
    },

    getCustomerOrders(token, signal) {
      return repository.getCustomerOrders(token, signal);
    },

    getCustomerOrderByNumber(token, orderNumber, signal) {
      return repository.getCustomerOrderByNumber(token, orderNumber, signal);
    },
  };
}
