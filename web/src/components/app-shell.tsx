import { Check, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useNewTask } from "@/features/tasks/new-task-context";

export function AppShell({ children }: { children: ReactNode }) {
  const openNewTask = useNewTask();

  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid size-6 place-items-center rounded-md bg-linear-to-br from-amber-400 to-orange-500 text-amber-950">
              <Check className="size-3.5" strokeWidth={2.5} />
            </span>
            Tasks
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={openNewTask}>
              <Plus data-icon="inline-start" />
              New task
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">{children}</main>
    </>
  );
}
