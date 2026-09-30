import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { Task } from "@/api/types";
import { useToast } from "@/app/toast";

import { TaskFormModal } from "./TaskFormModal";
import { useListParams } from "./useListParams";

const NewTaskContext = createContext<(() => void) | null>(null);

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

const overlayOpen = () => document.querySelector('[role="dialog"], [role="alertdialog"]') !== null;

/**
 * DESIGN 5.3. One create form for the whole app, reachable from the top bar,
 * the empty state and the N key, so it lives above the routes.
 */
export function NewTaskProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const { status, setStatus } = useListParams();

  const openNewTask = useCallback(() => setOpen(true), []);

  // DESIGN 8.3: N opens the form unless the user is typing or something is already open.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "n" && event.key !== "N") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target) || overlayOpen()) return;
      event.preventDefault();
      setOpen(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function onSaved(task: Task) {
    setOpen(false);
    const hidden = status !== null && status !== task.status;
    toast.success("Task created", {
      ...(hidden ? { action: { label: "View", onClick: () => setStatus(task.status) } } : {}),
    });
    // DESIGN 8.5: land on the new card once the refetch has drawn it.
    if (!hidden) {
      setTimeout(() => {
        document.querySelector<HTMLElement>(`a[href$="/tasks/${task.id}"]`)?.focus();
      }, 300);
    }
  }

  const value = useMemo(() => openNewTask, [openNewTask]);

  return (
    <NewTaskContext.Provider value={value}>
      {children}
      <TaskFormModal open={open} onClose={() => setOpen(false)} onSaved={onSaved} />
    </NewTaskContext.Provider>
  );
}

export function useNewTask() {
  const open = useContext(NewTaskContext);
  if (!open) throw new Error("useNewTask must be used inside NewTaskProvider");
  return open;
}
