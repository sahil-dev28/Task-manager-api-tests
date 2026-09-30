import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { ToastViewport, type ToastData, type ToastVariant } from "@/components/ui/Toast";

type ToastOptions = Pick<ToastData, "detail" | "action">;

type ToastApi = {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

/** DESIGN 4.13: at most three on screen; a fourth pushes the oldest out. */
const MAX_VISIBLE = 3;

let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((variant: ToastVariant, message: string, options?: ToastOptions) => {
    seq += 1;
    setToasts((current) => [...current, { id: seq, variant, message, ...options }].slice(-MAX_VISIBLE));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message, options) => push("success", message, options),
      error: (message, options) => push("error", message, options),
      info: (message, options) => push("info", message, options),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside ToastProvider");
  return api;
}
