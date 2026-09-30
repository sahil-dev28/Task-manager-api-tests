import type { InputHTMLAttributes, Ref } from "react";

import { cn } from "@/lib/cn";

import { controlClass } from "./Field";

export function TextInput({
  invalid = false,
  className,
  ref,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; ref?: Ref<HTMLInputElement> }) {
  return (
    <input
      ref={ref}
      type="text"
      aria-invalid={invalid || undefined}
      className={cn(controlClass(invalid), "h-9 px-3", className)}
      {...rest}
    />
  );
}
