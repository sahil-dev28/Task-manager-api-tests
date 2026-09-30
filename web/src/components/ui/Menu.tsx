import type { LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { IconButton } from "./IconButton";
import { Kbd } from "./Kbd";

export type MenuItem =
  | { label: string; icon: LucideIcon; onSelect: () => void; destructive?: boolean; kbd?: string }
  | "divider";

const isItem = (item: MenuItem): item is Exclude<MenuItem, "divider"> => item !== "divider";

/**
 * DESIGN 4.19. The trigger and its popover in one piece: arrows move the
 * highlight, Enter or Space picks, Esc closes and hands focus back, a letter
 * jumps to the first item that starts with it.
 */
export function Menu({
  label,
  icon,
  items,
  size = "sm",
  disabled = false,
  triggerClassName,
}: {
  label: string;
  icon: LucideIcon;
  items: MenuItem[];
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  triggerClassName?: string;
}) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const entries = items.filter(isItem);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')[highlight]?.focus();
  }, [open, highlight]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!listRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function pick(item: Exclude<MenuItem, "divider">) {
    close(false);
    item.onSelect();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const last = entries.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlight((i) => (i === last ? 0 : i + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlight((i) => (i === 0 ? last : i - 1));
        break;
      case "Home":
        event.preventDefault();
        setHighlight(0);
        break;
      case "End":
        event.preventDefault();
        setHighlight(last);
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        close(true);
        break;
      case "Tab":
        close(false);
        break;
      default: {
        if (event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey) return;
        const letter = event.key.toLowerCase();
        const index = entries.findIndex((item) => item.label.toLowerCase().startsWith(letter));
        if (index >= 0) setHighlight(index);
      }
    }
  }

  return (
    <span className="relative inline-flex">
      <IconButton
        ref={triggerRef}
        label={label}
        icon={icon}
        size={size}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          setHighlight(0);
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setHighlight(0);
            setOpen(true);
          }
        }}
        className={cn(triggerClassName, open && "bg-muted text-primary md:opacity-100")}
      />
      {open ? (
        <div
          ref={listRef}
          id={id}
          role="menu"
          aria-label={label}
          onKeyDown={onKeyDown}
          className="animate-menu-in absolute right-0 top-full z-30 mt-1 min-w-[200px] origin-top-right rounded-md border border-default bg-raised p-1 shadow-md"
        >
          {items.map((item, index) => {
            if (item === "divider") {
              return <div key={`divider-${index}`} role="separator" className="my-1 h-px bg-default" />;
            }
            const position = entries.indexOf(item);
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={position === highlight ? 0 : -1}
                onMouseEnter={() => setHighlight(position)}
                onClick={() => pick(item)}
                className={cn(
                  "flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-body outline-none",
                  "transition-colors duration-[120ms]",
                  item.destructive ? "text-danger-text" : "text-primary",
                  position === highlight && (item.destructive ? "bg-danger-subtle" : "bg-subtle"),
                )}
              >
                <Icon aria-hidden className={cn("size-4", !item.destructive && "text-secondary")} strokeWidth={1.75} />
                <span className="flex-1">{item.label}</span>
                {item.kbd ? <Kbd className="hidden text-caption text-tertiary lg:inline-flex">{item.kbd}</Kbd> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </span>
  );
}
