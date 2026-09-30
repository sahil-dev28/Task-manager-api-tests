import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getStats, listTasks } from "@/api/tasks";
import type { TaskStatus } from "@/api/types";

export const PAGE_SIZE = 10;

export const taskKeys = {
  stats: () => ["stats"] as const,
  page: (status: TaskStatus | null, page: number) => ["tasks", { status, page }] as const,
};

export function useStats() {
  return useQuery({
    queryKey: taskKeys.stats(),
    queryFn: ({ signal }) => getStats(signal),
  });
}

export function useTasksPage(status: TaskStatus | null, page: number) {
  return useQuery({
    queryKey: taskKeys.page(status, page),
    queryFn: ({ signal }) => listTasks({ status, page, limit: PAGE_SIZE }, signal),
    // Keep the old cards on screen, dimmed, instead of flashing a skeleton on every filter click.
    placeholderData: keepPreviousData,
  });
}

/**
 * The API returns bare arrays with no total, so the only exact way to know
 * whether Next leads anywhere is to ask for the next page. It shares the page's
 * query key, so clicking Next then renders straight from cache.
 */
export function useLookahead(status: TaskStatus | null, page: number) {
  const query = useQuery({
    queryKey: taskKeys.page(status, page + 1),
    queryFn: ({ signal }) => listTasks({ status, page: page + 1, limit: PAGE_SIZE }, signal),
  });

  return { ...query, hasNext: (query.data?.length ?? 0) > 0 };
}
