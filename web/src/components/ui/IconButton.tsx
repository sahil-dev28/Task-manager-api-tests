import type { LucideIcon } from "lucide-react";
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Variant = "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  ghost: "text-secondary hover:bg-subtle hover:text-primary active:bg-muted",
  outline:
    "bg-surface border border-strong text-secondary hover:bg-subtle hover:text-primary active:bg-muted",
};

const SIZE: Record<Size, string> = {
  sm: "size-7 rounded-xs",
  md: "size-8 rounded-sm",
  lg: "size-9 rounded-sm",
};

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: LucideIcon;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function IconButton({
  label,
  icon: Icon,
  variant = "ghost",
  size = "md",
  loading = false,
  disabled = false,
  className,
  onClick,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-busy={loading || undefined}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "inline-grid place-items-center transition-colors duration-[120ms]",
        SIZE[size],
        VARIANT[variant],
        disabled && (variant === "outline" ? "border-default text-disabled" : "text-disabled"),
        disabled && "cursor-not-allowed",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
      ) : (
        <Icon aria-hidden className={size === "lg" ? "size-[18px]" : "size-4"} strokeWidth={1.75} />
      )}
    </button>
  );
}
