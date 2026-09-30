import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

import { controlClass } from "./Field";

/**
 * DESIGN 4.5: a native select so keyboard and mobile pickers come for free,
 * with the current value's icon drawn over its left padding.
 */
export function Select({
  icon: Icon,
  iconClassName,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { icon?: LucideIcon; iconClassName?: string }) {
  return (
    <span className="relative block">
      {Icon ? (
        <Icon
          aria-hidden
          className={cn("pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2", iconClassName)}
          strokeWidth={1.75}
        />
      ) : null}
      <select
        className={cn(controlClass(false), "h-9 appearance-none pr-[34px]", Icon ? "pl-[34px]" : "pl-3", className)}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-tertiary"
        strokeWidth={1.75}
      />
    </span>
  );
}
