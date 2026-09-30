import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

import { controlClass } from "./Field";

/** DESIGN 4.4: four lines tall, vertical resize only, scrolls past 240px. */
export function Textarea({
  invalid = false,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(controlClass(invalid), "max-h-60 min-h-24 resize-y px-3 py-2", className)}
      {...rest}
    />
  );
}
