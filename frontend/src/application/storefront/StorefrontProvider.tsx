import { ReactNode } from 'react';
import { StorefrontContext } from './StorefrontContext';
import { createStorefrontUseCases } from './useCases';
import { createMagentoStorefrontRepository } from '@/infrastructure/magento/magentoStorefrontRepository';

const repository = createMagentoStorefrontRepository();
const useCases = createStorefrontUseCases(repository);

export function StorefrontProvider({ children }: { children: ReactNode }) {
  return (
    <StorefrontContext.Provider value={{ useCases }}>
      {children}
    </StorefrontContext.Provider>
  );
}
