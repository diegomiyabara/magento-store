import { useStorefrontServices } from '../../app/storefrontContext';
import { useAsyncData } from '../../lib/api/useAsyncData';

export function useStorefrontShellController() {
  const { useCases } = useStorefrontServices();
  const shell = useAsyncData((signal) => useCases.getShell(signal), []);

  return {
    categories: shell.data?.navigation ?? [],
    isLoading: shell.isLoading,
    storeConfig: shell.data?.storeConfig ?? null,
  };
}
