import { useStorefrontServices } from '@/application/storefront/StorefrontContext';
import { useAsyncData } from '@/application/shared/useAsyncData';

export function useProductPage(urlKey: string) {
  const { useCases } = useStorefrontServices();
  const state = useAsyncData((signal) => useCases.getProductPage(urlKey, signal), [urlKey]);

  return {
    error: state.error,
    isLoading: state.isLoading,
    product: state.data ?? null,
  };
}
