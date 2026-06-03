import { createContext, useContext } from 'react';
import type { createStorefrontUseCases } from './useCases';

type StorefrontUseCases = ReturnType<typeof createStorefrontUseCases>;

interface StorefrontContextValue {
  useCases: StorefrontUseCases;
}

export const StorefrontContext = createContext<StorefrontContextValue | null>(null);

export function useStorefrontServices(): StorefrontContextValue {
  const context = useContext(StorefrontContext);

  if (!context) {
    throw new Error('StorefrontContext nao inicializado.');
  }

  return context;
}
