import type { LucideIcon } from "lucide-react";
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Kbd } from "./Kbd";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-ghost";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent shadow-xs hover:bg-accent-hover hover:shadow-ink active:bg-accent-active",
  secondary:
    "bg-surface text-primary border border-strong shadow-xs hover:bg-subtle active:bg-muted",
  ghost: "text-secondary hover:bg-subtle hover:text-primary active:bg-muted",
  danger: "bg-danger text-on-accent hover:bg-danger-hover active:bg-danger-active",
  "danger-ghost": "text-danger-text hover:bg-danger-subtle",
};

const SIZE: Record<Size, string> = {
  sm: "h-7 px-2.5 text-caption rounded-xs",
  md: "h-9 px-3.5 text-body-strong rounded-sm",
  lg: "h-10 px-4 text-body-strong rounded-sm",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leadingIcon?: LucideIcon;
  /** DESIGN 4.1: only the primary "New task" button carries the amber chip. */
  mark?: boolean;
  kbd?: string;
  children?: ReactNode;
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  leadingIcon: Icon,
  mark = false,
  kbd,
  disabled = false,
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const inert = disabled || loading;

  return (
    <button
      type="button"
      aria-busy={loading || undefined}
      aria-disabled={disabled || undefined}
      onClick={inert ? undefined : onClick}
      className={cn(
        "inline-flex select-none items-center gap-1.5 font-sans transition-[background-color,border-color,color,box-shadow] duration-[120ms]",
        SIZE[size],
        VARIANT[variant],
        mark && "gap-2 py-1 pl-1 pr-3.5",
        inert && "cursor-not-allowed",
        disabled && "bg-muted text-disabled shadow-none",
        className,
      )}
      {...rest}
    >
      {mark && Icon ? (
        <span className="bg-mark grid size-7 place-items-center rounded-xs text-mark-ink">
          {loading ? (
            <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
          ) : (
            <Icon aria-hidden className="size-3.5" strokeWidth={2} />
          )}
        </span>
      ) : loading ? (
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
      ) : Icon ? (
        <Icon aria-hidden className="size-4" strokeWidth={1.75} />
      ) : null}
      {children}
      {kbd ? <Kbd className="ml-1.5 bg-white/20 text-on-accent">{kbd}</Kbd> : null}
    </button>
  );
}
