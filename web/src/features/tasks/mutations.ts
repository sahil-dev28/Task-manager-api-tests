import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/api/client";
import { completeTask, deleteTask } from "@/api/tasks";
import type { Task } from "@/api/types";

import { taskKeys } from "./queries";

/** After any write, the counts and the current page are refetched. */
export const invalidateTasks = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: taskKeys.stats() }),
    queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  ]);

/** A 404 mid-action means the in-memory store was cleared by a server restart. */
export const isGone = (error: unknown) => error instanceof ApiError && error.status === 404;

export const failureMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: Task) => completeTask(task.id),
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
