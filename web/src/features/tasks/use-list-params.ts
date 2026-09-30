import { useCallback } from "react";
import { useSearchParams } from "react-router";

import { taskStatuses, type TaskStatus } from "@/api/types";

import { PAGE_SIZE } from "./queries";

const isStatus = (value: string | null): value is TaskStatus =>
  value !== null && (taskStatuses as readonly string[]).includes(value);

export const rangeText = (page: number, count: number) => {
  const first = (page - 1) * PAGE_SIZE + 1;
  return `Showing ${first}–${first + count - 1}`;
};

/** The status filter and page live in the URL, so a reload or a shared link restores the view. */
export function useListParams() {
  const [params, setParams] = useSearchParams();

  const raw = params.get("status");
  const status = isStatus(raw) ? raw : null;

  const parsed = Number.parseInt(params.get("page") ?? "", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const setStatus = useCallback(
    (next: TaskStatus | null) => {
      const updated = new URLSearchParams();
      if (next) updated.set("status", next);
      setParams(updated);
    },
    [setParams],
  );

  const setPage = useCallback(
    (next: number) => {
      const updated = new URLSearchParams();
      if (status) updated.set("status", status);
      if (next > 1) updated.set("page", String(next));
      setParams(updated);
    },
    [setParams, status],
  );

  return { status, page, setStatus, setPage };
}
