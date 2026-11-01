import { useCallback, useEffect, useMemo, useState } from 'react';
import useFetch from './useFetch';
import useDebounce from './useDebounce';
import { PAGE_SIZE } from '../constants/config';

export default function useResourceList(service, initialFilters = {}) {
  const [page, setPage] = useState(1);
  const [search, setSearchValue] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const debounced = useDebounce(search, 400);

  const params = useMemo(() => {
    const result = { page, limit: PAGE_SIZE };
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined) result[key] = value;
    });
    if (debounced.trim()) result.search = debounced.trim();
    return result;
  }, [page, filters, debounced]);

  const { data, meta, loading, error, refetch } = useFetch(() => service.list(params), [params]);

  useEffect(() => {
    if (!loading && page > 1 && data && data.length === 0) setPage((value) => value - 1);
  }, [loading, data, page]);

  const setSearch = useCallback((value) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const setFilter = useCallback((key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }, []);

  return {
    items: data || [],
    meta,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch,
    filters,
    setFilter,
    refetch
  };
}