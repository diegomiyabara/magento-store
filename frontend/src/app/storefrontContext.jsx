import { createContext, useContext } from 'react';

export const StorefrontContext = createContext(null);

export function useStorefrontServices() {
  const context = useContext(StorefrontContext);

  if (!context) {
    throw new Error('StorefrontContext nao inicializado.');
  }

  return context;
}
