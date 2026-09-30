import { CircleAlert } from "lucide-react";
import { useId, useRef } from "react";

import { Button } from "./Button";
import { Overlay } from "./Overlay";

/** DESIGN 4.17. Cancel takes focus on open so a stray Enter is safe. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onCancel,
  onConfirm,
  loading = false,
  error = null,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
}) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Overlay
      open={open}
      onClose={onCancel}
      role="alertdialog"
      labelledBy={titleId}
      initialFocus={cancelRef}
      locked={loading}
      className="w-[400px] max-w-full rounded-lg bg-raised p-6 shadow-lg"
    >
      <h2 id={titleId} className="text-title-3 text-primary">
        {title}
      </h2>
      <p className="mt-2 text-small text-secondary">{body}</p>
      {error ? (
        <p role="alert" className="mt-3 flex items-center gap-1 text-small text-danger-text">
          <CircleAlert aria-hidden className="size-3.5" strokeWidth={1.75} />
          {error}
        </p>
      ) : null}
      <div className="mt-6 flex justify-end gap-2">
        <Button ref={cancelRef} disabled={loading} onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Overlay>
  );
}
