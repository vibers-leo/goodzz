import { useMemo } from 'react';
import Fuse from 'fuse.js';

interface UseFuzzySearchOptions<T> {
  data: T[];
  keys: string[];
  threshold?: number;
}

export function useFuzzySearch<T>({ data, keys, threshold = 0.3 }: UseFuzzySearchOptions<T>) {
  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys,
      threshold, // 0.0 = 완전 일치, 1.0 = 모든 것 일치
      ignoreLocation: true,
      useExtendedSearch: true,
      minMatchCharLength: 2,
    });
  }, [data, keys, threshold]);

  const search = (query: string): T[] => {
    if (!query || query.trim() === '') {
      return data;
    }

    const results = fuse.search(query);
    return results.map(result => result.item);
  };

  return { search };
}
