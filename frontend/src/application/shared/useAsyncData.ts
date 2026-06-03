import { useEffect, useState, type DependencyList } from 'react';

export interface AsyncDataState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  reload: () => void;
}

export function useAsyncData<T>(
  loader: (signal: AbortSignal) => Promise<T | null>,
  deps: DependencyList = [],
): AsyncDataState<T> {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<{ data: T | null; error: Error | null; isLoading: boolean }>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    setState((current) => ({
      data: current.data,
      error: null,
      isLoading: true,
    }));

    loader(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          data,
          error: null,
          isLoading: false,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setState((current) => ({
          data: current.data,
          error: error instanceof Error ? error : new Error(String(error)),
          isLoading: false,
        }));
      });

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return {
    ...state,
    isInitialLoading: state.isLoading && state.data == null,
    isRefreshing: state.isLoading && state.data != null,
    reload() {
      setReloadKey((current) => current + 1);
    },
  };
}
