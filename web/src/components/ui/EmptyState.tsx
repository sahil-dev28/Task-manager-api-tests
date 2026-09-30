import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  body,
  actions,
  tone = "default",
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  actions?: ReactNode;
  tone?: "default" | "error";
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-strong bg-surface px-6 py-12 text-center">
      <span
        className={cn(
          "grid size-12 place-items-center rounded-full",
          tone === "error" ? "bg-danger-subtle text-danger-subtle-text" : "bg-subtle text-secondary",
        )}
      >
        <Icon aria-hidden className="size-[22px]" strokeWidth={1.75} />
      </span>
      <h2 className="mt-4 text-title-3 text-primary">{title}</h2>
      <p className="mt-1.5 max-w-100 text-small text-secondary">{body}</p>
      {actions ? <div className="mt-5 flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
