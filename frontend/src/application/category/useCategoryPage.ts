import { useStorefrontServices } from '@/application/storefront/StorefrontContext';
import { useAsyncData } from '@/application/shared/useAsyncData';

export function useCategoryPage(
  urlKey: string,
  currentPage = 1,
  sort: Record<string, string> = { name: 'ASC' },
) {
  const { useCases } = useStorefrontServices();
  const state = useAsyncData(
    (signal) => useCases.getCategoryPage(urlKey, { currentPage, sort }, signal),
    [urlKey, currentPage, JSON.stringify(sort)],
  );

  return {
    category: state.data?.category ?? null,
    error: state.error,
    isLoading: state.isLoading,
    products: state.data?.products ?? [],
    totalCount: state.data?.totalCount ?? 0,
    totalPages: state.data?.totalPages ?? 1,
  };
}
