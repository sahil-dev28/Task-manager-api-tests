import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { ApiError } from "@/api/client";
import { listTasks } from "@/api/tasks";
import type { Task, TaskStatus } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DeleteDialog } from "./delete-dialog";
import { failureMessage, isGone, useCompleteTask } from "./mutations";
import { useLookahead, useStats, useTasksPage } from "./queries";
import { useAddSampleTasks } from "./sample-tasks";
import { StatsRow } from "./stats-row";
import { TaskFormDialog } from "./task-form-dialog";
import { TaskList } from "./task-list";
import { rangeText, useListParams } from "./use-list-params";

const FILTERS: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export function OverviewPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { id: editId } = useParams();
  const { status, page, setStatus, setPage } = useListParams();

  const stats = useStats();
  const list = useTasksPage(status, page);
  const lookahead = useLookahead(status, page);
  const tasks = list.data ?? [];
  const firstLoad = list.isPending && !list.isPlaceholderData;

  const complete = useCompleteTask();
  const samples = useAddSampleTasks();
  const [deleting, setDeleting] = useState<Task | null>(null);

  const overdue = stats.data?.overdue ?? 0;
  useEffect(() => {
    document.title = overdue > 0 ? `(${overdue} overdue) Tasks` : "Tasks";
  }, [overdue]);

  // A page emptied by a delete falls back one page.
  useEffect(() => {
    if (list.isSuccess && !list.isFetching && tasks.length === 0 && page > 1) setPage(page - 1);
  }, [list.isSuccess, list.isFetching, tasks.length, page, setPage]);

  // /tasks/:id opens the edit dialog. The task is usually on the current page; a
  // deep link that misses it fetches the whole list once, since there is no GET /tasks/:id.
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
    if (lookup.isError || (lookup.isSuccess && !lookup.data.some((task) => task.id === editId))) {
      toast.info("That task doesn't exist anymore", { description: "The server may have restarted." });
      navigate({ pathname: "/", search }, { replace: true });
    }
  }, [editId, onPage, list.isSuccess, lookup.isSuccess, lookup.isError, lookup.data, navigate, search]);

  function onComplete(task: Task) {
    complete.mutate(task, {
      onSuccess: () => toast.success("Marked complete", { description: task.title }),
      onError: (error) =>
        isGone(error)
          ? toast.info("This task no longer exists", { description: "The server may have restarted." })
          : toast.error(`Couldn't complete “${task.title}”`, { description: failureMessage(error) }),
    });
  }

  const counts: Record<TaskStatus | "all", number | null> = {
    all: stats.data ? stats.data.todo + stats.data.in_progress + stats.data.done : null,
    todo: stats.data?.todo ?? null,
    in_progress: stats.data?.in_progress ?? null,
    done: stats.data?.done ?? null,
  };

  const showPager = !firstLoad && !list.isError && tasks.length > 0 && (page > 1 || lookahead.hasNext);

  return (
    <>
      <div className="pt-8">
        <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stored in memory on the API. Everything resets when the server restarts.
        </p>
      </div>

      <StatsRow
        stats={stats.data}
        isLoading={stats.isPending}
        isError={stats.isError}
        activeStatus={status}
        onSelectStatus={setStatus}
        onRetry={() => stats.refetch()}
      />

      <div className="mt-8 flex items-center justify-between gap-3">
        <Tabs
          value={status ?? "all"}
          onValueChange={(value) => setStatus(value === "all" ? null : (value as TaskStatus))}
        >
          <TabsList>
            {FILTERS.map(({ value, label }) => (
              <TabsTrigger key={value} value={value} disabled={firstLoad}>
                {label}
                <span className="text-muted-foreground tabular-nums">{counts[value] ?? "·"}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {tasks.length > 0 ? (
          <span className="hidden font-mono text-xs text-muted-foreground sm:block">
            {rangeText(page, tasks.length)}
          </span>
        ) : null}
      </div>

      <TaskList
        tasks={tasks}
        isLoading={firstLoad}
        isDimmed={list.isPlaceholderData && list.isFetching}
        isError={list.isError}
        error={list.error instanceof ApiError ? list.error.message : null}
        activeStatus={status}
        busyId={complete.isPending ? (complete.variables?.id ?? null) : null}
        onComplete={onComplete}
        onEdit={(task) => navigate({ pathname: `/tasks/${task.id}`, search })}
        onDelete={setDeleting}
        onAddSamples={() => samples.mutate()}
        samplesLoading={samples.isPending}
        onShowAll={() => setStatus(null)}
        onRetry={() => list.refetch()}
      />

      {showPager ? (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-end gap-3">
          <span className="font-mono text-xs text-muted-foreground">PAGE {page}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft data-icon="inline-start" />
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!lookahead.hasNext} onClick={() => setPage(page + 1)}>
              Next
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </nav>
      ) : null}

      <TaskFormDialog open={editing !== null} task={editing} onOpenChange={(open) => !open && closeEdit()} />

      <DeleteDialog
        task={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={(task) => task.id === editId && closeEdit()}
      />
    </>
  );
}
