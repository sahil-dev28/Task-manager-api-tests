import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * DESIGN 4.3 anatomy shared by every form control: label, 6px, control, 6px,
 * then one of helper text, warning text or error text. The control receives the
 * ids it needs to point `aria-describedby` at whichever line is showing.
 */
export function Field({
  id,
  label,
  helper,
  warning,
  error,
  counter,
  children,
}: {
  id: string;
  label: string;
  helper?: string;
  warning?: string;
  error?: string | null;
  counter?: string;
  children: (props: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}) {
  const messageId = `${id}-message`;
  const message = error ?? warning ?? helper;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-caption text-secondary">
        {label}
      </label>
      {children({ id, describedBy: message ? messageId : undefined, invalid: Boolean(error) })}
      {message || counter ? (
        <div className="mt-1.5 flex items-start justify-between gap-3 text-small">
          {message ? (
            <span
              id={messageId}
              className={cn(
                "flex items-center gap-1",
                error ? "text-danger-text" : warning ? "text-warning" : "text-tertiary",
              )}
            >
              {error ? <CircleAlert aria-hidden className="size-3.5 shrink-0" strokeWidth={1.75} /> : null}
              {message}
            </span>
          ) : (
            <span />
          )}
          {counter ? <span className="shrink-0 tabular-nums text-tertiary">{counter}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

/** The one look every field shares — border, focus glow, error and disabled treatments. */
export const controlClass = (invalid: boolean) =>
  cn(
    "w-full rounded-sm border bg-surface text-body text-primary shadow-xs placeholder:text-tertiary",
    "transition-[border-color,box-shadow] duration-[120ms] outline-none",
    "focus:border-focus focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--c-focus-ring)_18%,transparent)]",
    "read-only:bg-subtle disabled:bg-subtle disabled:text-disabled disabled:shadow-none",
    invalid
      ? "border-danger-text focus:border-danger-text focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--c-danger-text)_20%,transparent)]"
      : "border-input hover:border-strong",
  );
