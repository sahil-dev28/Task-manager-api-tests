import { QueryClient } from "@tanstack/react-query";

/**
 * DESIGN §6: GETs retry once after 1s; mutations are never retried automatically,
 * because a repeated POST or PATCH could apply twice.
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: 1, retryDelay: 1000, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
