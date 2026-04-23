import { StorefrontContext } from './storefrontContext';
import { createStorefrontUseCases } from '../application/storefront/useCases';
import { createMagentoStorefrontRepository } from '../infrastructure/magento/magentoStorefrontRepository';

const repository = createMagentoStorefrontRepository();
const useCases = createStorefrontUseCases(repository);

export function StorefrontProvider({ children }) {
  return (
    <StorefrontContext.Provider value={{ useCases }}>
      {children}
    </StorefrontContext.Provider>
  );
}
