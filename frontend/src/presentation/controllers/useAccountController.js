import { useAuth } from '../../app/authContext';
import { useStorefrontServices } from '../../app/storefrontContext';
import { useAsyncData } from '../../lib/api/useAsyncData';

export function useAccountController() {
  const auth = useAuth();
  const { useCases } = useStorefrontServices();
  const state = useAsyncData(
    (signal) => {
      if (!auth.token) {
        return Promise.resolve(null);
      }

      return useCases.getCustomerDashboard(auth.token, signal);
    },
    [auth.token, useCases],
  );

  return {
    addresses: state.data?.addresses ?? [],
    customer: state.data?.customer ?? auth.customer ?? null,
    defaultBillingAddress: state.data?.defaultBillingAddress ?? null,
    defaultShippingAddress: state.data?.defaultShippingAddress ?? null,
    error: state.error,
    isInitialLoading: auth.isAuthenticated ? state.isInitialLoading : false,
    isLoading: auth.isAuthenticated ? state.isLoading : false,
    isRefreshing: auth.isAuthenticated ? state.isRefreshing : false,
    isSubscribed: state.data?.isSubscribed ?? false,
    orders: state.data?.orders ?? [],
    ordersTotalCount: state.data?.ordersTotalCount ?? 0,
    reload: state.reload,
    token: auth.token,
    useCases,
  };
}
