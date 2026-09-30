import { X } from "lucide-react";
import { useId, type ReactNode, type RefObject } from "react";

import { IconButton } from "./IconButton";
import { Overlay } from "./Overlay";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  initialFocus,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  initialFocus?: RefObject<HTMLElement | null>;
}) {
  const titleId = useId();

  return (
    <Overlay
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      initialFocus={initialFocus}
      className="flex max-h-[calc(100dvh-64px)] w-[560px] max-w-full flex-col rounded-lg bg-raised shadow-lg"
    >
      <div className="px-6 pt-5">
        <h2 id={titleId} className="text-title-3 text-primary">
          {title}
        </h2>
      </div>
      <div className="min-h-0 overflow-y-auto px-6 py-5">{children}</div>
      {footer ? (
        <div className="flex items-center justify-between gap-2 border-t border-default px-6 py-4">
          {footer}
        </div>
      ) : null}
      {/* DESIGN 8.2: Close is the last tab stop, so it sits after the footer in
          the DOM and is only drawn in the header. */}
      <IconButton label="Close" icon={X} onClick={onClose} className="absolute right-5 top-4" />
    </Overlay>
  );
}
