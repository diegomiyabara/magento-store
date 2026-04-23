import { useEffect, useState } from 'react';

export function useAsyncData(loader, deps = []) {
  const [state, setState] = useState({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    setState({
      data: null,
      error: null,
      isLoading: true,
    });

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
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          data: null,
          error,
          isLoading: false,
        });
      });

    return () => {
      controller.abort();
    };
  }, deps);

  return state;
}
