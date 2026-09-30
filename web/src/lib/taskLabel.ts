import type { Task } from "@/api/types";

import { formatRelativeDate, isOverdue } from "./dates";
import { PRIORITY_LABEL, STATUS_LABEL } from "./vocab";

/** DESIGN 8.6. Order and wording are fixed; clauses appear only when they apply. */
export function taskAccessibleName(task: Task, now: Date = new Date()): string {
  const readable = PRIORITY_LABEL[task.priority];
  const priority = `${readable.charAt(0)}${readable.slice(1).toLowerCase()} priority`;

  const parts = [task.title, STATUS_LABEL[task.status], priority];
  if (isOverdue(task, now)) parts.push("overdue");
  if (task.dueDate) parts.push(`due ${formatRelativeDate(task.dueDate, now)}`);
  if (task.assignee) parts.push(`assigned to ${task.assignee}`);

  return parts.join(", ");
}
