import type { TaskPriority } from "@/api/types";
import { cn } from "@/lib/cn";
import { PRIORITY_ICON, PRIORITY_LABEL } from "@/lib/vocab";

const TONE: Record<TaskPriority, string> = {
  low: "text-secondary",
  medium: "text-warning",
  high: "text-danger-text",
};

/** DESIGN 4.9: the icon is heavier than the 1.75 default because the signal bars
 *  sit in the lower half of the glyph and vanish at a lighter weight. */
export function PriorityIndicator({
  priority,
  variant = "full",
}: {
  priority: TaskPriority;
  variant?: "full" | "compact";
}) {
  const Icon = PRIORITY_ICON[priority];
  const readable = PRIORITY_LABEL[priority].charAt(0) + PRIORITY_LABEL[priority].slice(1).toLowerCase();

  if (variant === "compact") {
    return (
      <span aria-label={`Priority: ${readable}`} className={cn("inline-flex", TONE[priority])}>
        <Icon aria-hidden className="size-4" strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex h-5 items-center gap-1 font-mono text-mono", TONE[priority])}>
      <Icon aria-hidden className="size-4" strokeWidth={2.5} />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
