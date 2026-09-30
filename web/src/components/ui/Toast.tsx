import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

import { IconButton } from "./IconButton";

export type ToastVariant = "success" | "error" | "info";

export type ToastData = {
  id: number;
  variant: ToastVariant;
  message: string;
  detail?: string;
  action?: { label: string; onClick: () => void };
};

/** DESIGN 4.13. The toast is dark in both themes, so its icon colours are fixed. */
const VARIANT: Record<ToastVariant, { icon: typeof Info; color: string; duration: number }> = {
  success: { icon: CircleCheck, color: "#5BD68A", duration: 4000 },
  error: { icon: CircleAlert, color: "#FF8A75", duration: 8000 },
  info: { icon: Info, color: "#AECBFF", duration: 4000 },
};

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  const { icon: Icon, color, duration } = VARIANT[toast.variant];
  const [paused, setPaused] = useState(false);

  // Hover or focus pauses the clock; leaving restarts it from the top.
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [paused, duration, toast.id, onDismiss]);

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      className={cn(
        "animate-toast-in pointer-events-auto flex w-[360px] max-w-full items-start gap-2.5 rounded-md",
        "bg-inverse py-3 pl-3.5 pr-3 text-inverse-fg shadow-md",
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={2} style={{ color }} />
      <div className="min-w-0 flex-1">
        <p className="text-small font-medium">{toast.message}</p>
        {toast.detail ? <p className="text-small opacity-75">{toast.detail}</p> : null}
      </div>
      {toast.action ? (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDismiss(toast.id);
          }}
          className="ml-1 shrink-0 text-caption font-semibold text-[#FAFAFA] hover:underline"
        >
          {toast.action.label}
        </button>
      ) : null}
      <IconButton
        label="Dismiss"
        icon={X}
        size="sm"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-inverse-fg/70 hover:bg-white/10 hover:text-inverse-fg"
      />
    </div>
  );
}

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
