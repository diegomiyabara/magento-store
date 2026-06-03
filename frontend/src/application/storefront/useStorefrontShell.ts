import { useStorefrontServices } from '@/application/storefront/StorefrontContext';
import { useAsyncData } from '@/application/shared/useAsyncData';
import type { CategoryModel } from '@/domain/storefront/models';

export function useStorefrontShell() {
  const { useCases } = useStorefrontServices();
  const shell = useAsyncData((signal) => useCases.getShell(signal), []);

  return {
    categories: (shell.data?.navigation ?? []).filter((c): c is CategoryModel => c !== null),
    isLoading: shell.isLoading,
    storeConfig: shell.data?.storeConfig ?? null,
  };
}
