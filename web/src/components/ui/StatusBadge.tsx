import type { TaskStatus } from "@/api/types";
import { cn } from "@/lib/cn";
import { STATUS_ICON, STATUS_LABEL } from "@/lib/vocab";

const TONE: Record<TaskStatus, string> = {
  todo: "bg-muted text-secondary",
  in_progress: "bg-blue-subtle text-blue-subtle-text",
  done: "bg-success-subtle text-success",
};

export function StatusBadge({
  status,
  size = "default",
}: {
  status: TaskStatus;
  size?: "default" | "large";
}) {
  const Icon = STATUS_ICON[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-sans",
        TONE[status],
        size === "large" ? "h-6 pl-2 pr-2.5 text-small font-medium" : "h-5 pl-1.5 pr-2 text-caption",
      )}
    >
      <Icon aria-hidden className={size === "large" ? "size-3.5" : "size-3"} strokeWidth={1.75} />
      {STATUS_LABEL[status]}
    </span>
  );
}
