import { useCallback, useEffect, useMemo, useState } from 'react';

export interface ServerPaginationState {
  page: number;
  limit: number;
  cursor?: string;
  totalRecords: number;
  totalPages: number;
}

export interface ServerPaginationActions {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setCursor: (cursor?: string) => void;
  setTotalRecords: (total: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  reset: () => void;
}

export function useServerPagination(initialLimit = 10): ServerPaginationState & ServerPaginationActions {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [totalRecords, setTotalRecords] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalRecords / limit)),
    [totalRecords, limit]
  );

  const safePage = useMemo(() => Math.min(page, totalPages), [page, totalPages]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const goToNextPage = useCallback(() => {
    if (safePage < totalPages) setPage(safePage + 1);
  }, [safePage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (safePage > 1) setPage(safePage - 1);
  }, [safePage]);

  const goToFirstPage = useCallback(() => setPage(1), []);
  const goToLastPage = useCallback(() => setPage(totalPages), [totalPages]);

  const reset = useCallback(() => {
    setPage(1);
    setCursor(undefined);
    setTotalRecords(0);
  }, []);

  return {
    page: safePage,
    limit,
    cursor,
    totalRecords,
    totalPages,
    setPage,
    setLimit,
    setCursor,
    setTotalRecords,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    reset,
  };
}
