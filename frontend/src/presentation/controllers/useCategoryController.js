import { useStorefrontServices } from '../../app/storefrontContext';
import { useAsyncData } from '../../lib/api/useAsyncData';

export function useCategoryController(urlKey) {
  const { useCases } = useStorefrontServices();
  const state = useAsyncData((signal) => useCases.getCategoryPage(urlKey, signal), [urlKey]);

  return {
    category: state.data?.category ?? null,
    error: state.error,
    isLoading: state.isLoading,
    products: state.data?.products ?? [],
    totalCount: state.data?.totalCount ?? 0,
  };
}
