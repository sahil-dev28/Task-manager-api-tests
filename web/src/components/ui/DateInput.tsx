import { Calendar, X } from "lucide-react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

import { controlClass } from "./Field";
import { IconButton } from "./IconButton";

/** DESIGN 4.6: a native date input with a clear button once a value is set. */
export function DateInput({
  value,
  onChange,
  onClear,
  invalid = false,
  className,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  invalid?: boolean;
}) {
  return (
    <span className="relative block">
      <Calendar
        aria-hidden
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-tertiary"
        strokeWidth={1.75}
      />
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid || undefined}
        className={cn(controlClass(invalid), "h-9 pl-[34px]", value ? "pr-9" : "pr-3", className)}
        {...rest}
      />
      {value ? (
        <IconButton
          label="Clear due date"
          icon={X}
          size="sm"
          onClick={onClear}
          className="absolute right-1 top-1/2 -translate-y-1/2"
        />
      ) : null}
    </span>
  );
}
