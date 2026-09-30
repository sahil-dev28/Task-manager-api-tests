import { Circle, CircleCheck, CircleDashed, SignalHigh, SignalLow, SignalMedium } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { TaskPriority, TaskStatus } from "@/api/types";

export const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const STATUS_ICON: Record<TaskStatus, LucideIcon> = {
  todo: Circle,
  in_progress: CircleDashed,
  done: CircleCheck,
};

/** DESIGN 2.6 sets priority labels in mono, uppercase. */
export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
};

export const PRIORITY_ICON: Record<TaskPriority, LucideIcon> = {
  low: SignalLow,
  medium: SignalMedium,
  high: SignalHigh,
};
