import { useCallback, useEffect, useRef, useState } from 'react';

export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, meta: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));

    fetcherRef
      .current()
      .then((res) => {
        if (active) setState({ data: res.data, meta: res.meta || null, loading: false, error: null });
      })
      .catch((err) => {
        if (active) setState((current) => ({ ...current, loading: false, error: err.message }));
      });

    return () => {
      active = false;
    };
  }, [...deps, tick]);

  const refetch = useCallback(() => setTick((value) => value + 1), []);

  return { ...state, refetch };
}