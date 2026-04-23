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
  };
}
