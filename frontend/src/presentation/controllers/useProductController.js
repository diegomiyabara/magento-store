import { useStorefrontServices } from '../../app/storefrontContext';
import { useAsyncData } from '../../lib/api/useAsyncData';

export function useProductController(urlKey) {
  const { useCases } = useStorefrontServices();
  const state = useAsyncData((signal) => useCases.getProductPage(urlKey, signal), [urlKey]);

  return {
    error: state.error,
    isLoading: state.isLoading,
    product: state.data ?? null,
  };
}
