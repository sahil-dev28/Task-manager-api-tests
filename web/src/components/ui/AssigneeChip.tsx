import { User } from "lucide-react";

import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/initials";

export function AssigneeChip({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const initials = getInitials(name);
  const avatar = size === "md" ? "size-6 text-[11px]" : "size-[18px] text-[9px]";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn(
          "bg-avatar grid place-items-center rounded-full font-sans font-semibold tracking-[0.02em] text-avatar-ink",
          avatar,
        )}
      >
        {initials.kind === "text" ? initials.value : <User className="size-[11px]" strokeWidth={2} />}
      </span>
      <span
        title={name}
        className={cn(
          "max-w-40 truncate",
          size === "md" ? "text-body text-primary" : "text-caption text-secondary",
        )}
      >
        {name}
      </span>
    </span>
  );
}
