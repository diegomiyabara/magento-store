import { useStorefrontServices } from '../../app/storefrontContext';
import { useAsyncData } from '../../lib/api/useAsyncData';

export function useHomeController() {
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
