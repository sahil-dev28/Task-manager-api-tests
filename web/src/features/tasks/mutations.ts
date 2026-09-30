import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { ApiError, NetworkError } from "@/api/client";
import { completeTask, deleteTask } from "@/api/tasks";
import type { Task, TaskStats } from "@/api/types";
import { isOverdue } from "@/lib/dates";

import { taskKeys } from "./queries";

/** DESIGN 7.1: after every successful write except assign, counts and the page refetch. */
export function invalidateTasks(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: taskKeys.stats() }),
    queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  ]);
}

/** DESIGN §9: the same three failure shapes for every mutation. */
export function describeFailure(error: unknown): { gone: boolean; message: string; detail?: string } {
  if (error instanceof ApiError && error.status === 404) {
    return { gone: true, message: "This task no longer exists", detail: "The server may have restarted, which clears all tasks." };
  }
  if (error instanceof NetworkError) {
    return { gone: false, message: "Couldn't reach the server", detail: "Check that the API is running on localhost:3000." };
  }
  return { gone: false, message: error instanceof Error ? error.message : "Something went wrong" };
}

type PageSnapshot = [readonly unknown[], Task[] | undefined][];

/**
 * DESIGN 7.1 and 6.5: completing is optimistic. Every cached page and the
 * stats move at once; a failure puts back the exact snapshots.
 */
export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: Task) => completeTask(task.id),
    onMutate: async (task) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["tasks"] }),
        queryClient.cancelQueries({ queryKey: taskKeys.stats() }),
      ]);

      const pages: PageSnapshot = queryClient.getQueriesData<Task[]>({ queryKey: ["tasks"] });
      const stats = queryClient.getQueryData<TaskStats>(taskKeys.stats());

      const predicted: Task = { ...task, status: "done", completedAt: new Date().toISOString() };
      for (const [key, data] of pages) {
        if (data) queryClient.setQueryData(key, data.map((t) => (t.id === task.id ? predicted : t)));
      }
      if (stats && task.status !== "done") {
        queryClient.setQueryData<TaskStats>(taskKeys.stats(), {
          ...stats,
          [task.status]: Math.max(0, stats[task.status] - 1),
          done: stats.done + 1,
          overdue: isOverdue(task) ? Math.max(0, stats.overdue - 1) : stats.overdue,
        });
      }

      return { pages, stats };
    },
    onError: (_error, _task, context) => {
      for (const [key, data] of context?.pages ?? []) queryClient.setQueryData(key, data);
      if (context?.stats) queryClient.setQueryData(taskKeys.stats(), context.stats);
    },
    onSuccess: (server) => {
      for (const [key, data] of queryClient.getQueriesData<Task[]>({ queryKey: ["tasks"] })) {
        if (data) queryClient.setQueryData(key, data.map((t) => (t.id === server.id ? server : t)));
      }
    },
    onSettled: () => invalidateTasks(queryClient),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: Task) => deleteTask(task.id),
    onSettled: () => invalidateTasks(queryClient),
  });
}
