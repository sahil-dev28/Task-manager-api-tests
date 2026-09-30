import { jsonBody, request } from "./client";
import type { CreateTaskInput, ListTasksParams, Task, TaskStats, UpdateTaskInput } from "./types";

function query({ status, page, limit }: ListTasksParams): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page !== undefined) params.set("page", String(page));
  if (limit !== undefined) params.set("limit", String(limit));
  const search = params.toString();
  return search ? `?${search}` : "";
}

export const listTasks = (params: ListTasksParams, signal?: AbortSignal) =>
  request<Task[]>(`/tasks${query(params)}`, { signal });

export const getStats = (signal?: AbortSignal) => request<TaskStats>("/tasks/stats", { signal });

export const createTask = (input: CreateTaskInput, signal?: AbortSignal) =>
  request<Task>("/tasks", { method: "POST", ...jsonBody(input), signal });

export const updateTask = (id: string, input: UpdateTaskInput, signal?: AbortSignal) =>
  request<Task>(`/tasks/${id}`, { method: "PUT", ...jsonBody(input), signal });

export const completeTask = (id: string, signal?: AbortSignal) =>
  request<Task>(`/tasks/${id}/complete`, { method: "PATCH", signal });

export const assignTask = (id: string, assignee: string, signal?: AbortSignal) =>
  request<Task>(`/tasks/${id}/assign`, { method: "PATCH", ...jsonBody({ assignee }), signal });

export const deleteTask = (id: string, signal?: AbortSignal) =>
  request<void>(`/tasks/${id}`, { method: "DELETE", signal });
