import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Overlays can stack (a delete dialog above an edit form), so the page is
// released only when the last one closes.
let openCount = 0;

function lockPage() {
  openCount += 1;
  if (openCount > 1) return;
  document.getElementById("root")?.setAttribute("inert", "");
  document.body.style.overflow = "hidden";
}

function unlockPage() {
  openCount -= 1;
  if (openCount > 0) return;
  document.getElementById("root")?.removeAttribute("inert");
  document.body.style.overflow = "";
}

export type OverlayProps = {
  open: boolean;
  onClose: () => void;
  role?: "dialog" | "alertdialog";
  labelledBy: string;
  /** Focused on open. Without it, the first focusable element inside. */
  initialFocus?: RefObject<HTMLElement | null>;
  /** DESIGN 4.17: while a confirmation is in flight, Esc and the scrim do nothing. */
  locked?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * DESIGN 4.12 and 8.5. The scrim, the focus trap, `inert` on the page behind,
 * and focus return on close. Modal and ConfirmDialog are thin layers over it.
 */
export function Overlay({
  open,
  onClose,
  role = "dialog",
  labelledBy,
  initialFocus,
  locked = false,
  className,
  children,
}: OverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<Element | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement;
    lockPage();

    const target =
      initialFocus?.current ?? panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panelRef.current;
    target?.focus();

    return () => {
      unlockPage();
      const previous = returnTo.current;
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
    // initialFocus is a ref: reading .current at open time is the whole point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || locked) return;
      event.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, locked, onClose]);

  if (!open) return null;

  function trapTab(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        data-scrim
        aria-hidden
        onClick={locked ? undefined : onClose}
        className="animate-scrim-in absolute inset-0 bg-[var(--c-scrim)]"
      />
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={trapTab}
        className={cn("animate-overlay-in relative outline-none", className)}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
