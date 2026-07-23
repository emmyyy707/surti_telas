import { useMemo, useState } from 'react';

export const usePagination = <T>(items: T[], initialPage = 1, pageSize = 5) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const currentItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  );

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
  };
};



