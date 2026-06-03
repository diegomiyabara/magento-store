import { useStorefrontServices } from '@/application/storefront/StorefrontContext';
import { useAsyncData } from '@/application/shared/useAsyncData';

export function useHomePage() {
  const { useCases } = useStorefrontServices();
  const state = useAsyncData((signal) => useCases.getHomePage(signal), []);

  return {
    cmsPage: state.data?.cmsPage ?? null,
    error: state.error,
    featuredProducts: state.data?.featuredProducts ?? [],
    isLoading: state.isLoading,
    isReady: Boolean(state.data),
  };
}
