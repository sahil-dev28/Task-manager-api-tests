import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-xs px-[5px]",
        "font-mono text-[11px] font-medium",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
