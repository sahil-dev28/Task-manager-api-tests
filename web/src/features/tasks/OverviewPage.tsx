import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

import { ApiError } from "@/api/client";
import { listTasks } from "@/api/tasks";
import type { Task } from "@/api/types";
import { listAnnouncement, useAnnounce } from "@/app/LiveRegion";
import { useToast } from "@/app/toast";
import { useDocumentTitle } from "@/app/useDocumentTitle";

import { DeleteDialog } from "./DeleteDialog";
import { useNewTask } from "./NewTaskProvider";
import { Pagination } from "./Pagination";
import { StatsRow } from "./StatsRow";
import { TaskFormModal } from "./TaskFormModal";
import { TaskList } from "./TaskList";
import { Toolbar } from "./Toolbar";
import { describeFailure, useCompleteTask } from "./mutations";
import { taskKeys, useLookahead, useStats, useTasksPage } from "./queries";
import { useAddSampleTasks } from "./sampleTasks";
import { rangeText, useListParams } from "./useListParams";

const messageOf = (error: unknown) => (error instanceof ApiError ? error.message : null);

export function OverviewPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { id: editId } = useParams();
  const toast = useToast();
  const openNewTask = useNewTask();
  const { status, page, setStatus, setPage } = useListParams();

  const stats = useStats();
  const list = useTasksPage(status, page);
  const lookahead = useLookahead(status, page);

  const tasks = list.data ?? [];
  const firstLoad = list.isPending && !list.isPlaceholderData;

  // Transient UI intent, not URL state: which pager button was last clicked.
  const [pendingDirection, setPendingDirection] = useState<"previous" | "next" | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const complete = useCompleteTask();
  const samples = useAddSampleTasks();

  // DESIGN 5.1 and 8.4: mirror the overdue count in the title, announce list changes.
  const announce = useAnnounce();
  useDocumentTitle(stats.data?.overdue);
  useEffect(() => {
    const message = listAnnouncement({ isLoading: firstLoad, count: tasks.length, status, page });
    if (message) announce(message);
  }, [announce, firstLoad, tasks.length, status, page]);

  // DESIGN 4.15: a page emptied by a delete or a completion falls back one page.
  useEffect(() => {
    if (list.isSuccess && !list.isFetching && tasks.length === 0 && page > 1) setPage(page - 1);
  }, [list.isSuccess, list.isFetching, tasks.length, page, setPage]);

  // /tasks/:id opens the edit form. The task is usually on the current page;
  // a deep link that misses it fetches the whole list once (there is no GET /tasks/:id).
  const onPage = editId ? tasks.find((task) => task.id === editId) : undefined;
  const lookup = useQuery({
    queryKey: ["tasks", "lookup", editId],
    queryFn: ({ signal }) => listTasks({}, signal),
    enabled: Boolean(editId) && !onPage && list.isSuccess,
    gcTime: 0,
  });
  const editing = onPage ?? lookup.data?.find((task) => task.id === editId) ?? null;
  const closeEdit = () => navigate({ pathname: "/", search });

  useEffect(() => {
    if (!editId || onPage || !list.isSuccess) return;
    if (lookup.isSuccess && !lookup.data.some((task) => task.id === editId)) {
      toast.info("That task doesn't exist anymore.", { detail: "The server may have restarted." });
      navigate({ pathname: "/", search }, { replace: true });
    } else if (lookup.isError) {
      navigate({ pathname: "/", search }, { replace: true });
    }
  }, [editId, onPage, list.isSuccess, lookup.isSuccess, lookup.isError, lookup.data, navigate, search, toast]);

  function onComplete(task: Task) {
    complete.mutate(task, {
      onSuccess: () => toast.success("Marked complete", { detail: task.title }),
      onError: (error) => {
        const failure = describeFailure(error);
        if (failure.gone) toast.info(failure.message, { detail: failure.detail });
        else toast.error(`Couldn't complete “${task.title}”`, { detail: failure.message });
      },
    });
  }

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
        onComplete={onComplete}
        onEdit={(task) => navigate({ pathname: `/tasks/${task.id}`, search })}
        onDelete={setDeleting}
        onNewTask={openNewTask}
        onAddSamples={() => samples.mutate()}
        samplesLoading={samples.isPending}
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

      <TaskFormModal
        open={editing !== null}
        task={editing}
        onClose={closeEdit}
        onSaved={() => {
          toast.success("Changes saved");
          closeEdit();
        }}
      />

      <DeleteDialog
        task={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={(task) => {
          if (task.id === editId) closeEdit();
        }}
      />
    </>
  );
}
