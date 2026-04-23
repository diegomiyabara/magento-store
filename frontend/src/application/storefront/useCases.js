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

    getCustomerDashboard(token, signal) {
      return repository.getCustomerDashboard(token, signal);
    },
  };
}
