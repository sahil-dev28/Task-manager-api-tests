import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ApiError } from "@/api/client";

import { Pagination } from "./Pagination";
import { StatsRow } from "./StatsRow";
import { TaskList } from "./TaskList";
import { Toolbar } from "./Toolbar";
import { taskKeys, useLookahead, useStats, useTasksPage } from "./queries";
import { rangeText, useListParams } from "./useListParams";

const messageOf = (error: unknown) => (error instanceof ApiError ? error.message : null);

export function OverviewPage() {
  const queryClient = useQueryClient();
  const { status, page, setStatus, setPage } = useListParams();

  const stats = useStats();
  const list = useTasksPage(status, page);
  const lookahead = useLookahead(status, page);

  const tasks = list.data ?? [];
  const firstLoad = list.isPending && !list.isPlaceholderData;

  // Transient UI intent, not URL state: which pager button was last clicked.
  const [pendingDirection, setPendingDirection] = useState<"previous" | "next" | null>(null);

  return (
    <>
      <h1 className="pt-8 text-title-1">Overview</h1>
      <p className="mt-2 text-small text-secondary">
        Stored in memory on the API. Everything resets when the server restarts.
      </p>

      <StatsRow
        stats={stats.data}
        isLoading={stats.isPending}
        isError={stats.isError}
        activeStatus={status}
        onSelectStatus={setStatus}
        onRetry={() => queryClient.invalidateQueries({ queryKey: taskKeys.stats() })}
      />

      <Toolbar
        status={status}
        stats={stats.data}
        onStatusChange={setStatus}
        disabled={firstLoad}
        range={tasks.length > 0 ? rangeText(page, tasks.length) : null}
      />

      <TaskList
        tasks={tasks}
        isLoading={firstLoad}
        isDimmed={list.isPlaceholderData && list.isFetching}
        isError={list.isError}
        error={messageOf(list.error)}
        activeStatus={status}
        onComplete={() => {}}
        onNewTask={() => {}}
        onAddSamples={() => {}}
        onShowAll={() => setStatus(null)}
        onRetry={() => list.refetch()}
      />

      {!firstLoad && !list.isError && tasks.length > 0 ? (
        <Pagination
          page={page}
          hasNext={lookahead.hasNext}
          count={tasks.length}
          // DESIGN 4.15: the clicked button shows the spinner, so the page has to
          // remember which one was clicked until the fetch settles.
          pending={list.isFetching ? pendingDirection : null}
          onPrevious={() => {
            setPendingDirection("previous");
            setPage(page - 1);
          }}
          onNext={() => {
            setPendingDirection("next");
            setPage(page + 1);
          }}
        />
      ) : null}
    </>
  );
}
