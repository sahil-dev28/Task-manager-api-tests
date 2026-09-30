import { useRef } from "react";

import { cn } from "@/lib/cn";

export type Segment = { value: string; label: string; count?: number | null };

export function SegmentedControl({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  options: Segment[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function move(index: number) {
    const next = options[index];
    if (!next) return;
    refs.current[index]?.focus();
    onChange(next.value);
  }

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const last = options.length - 1;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        move(index === last ? 0 : index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        move(index === 0 ? last : index - 1);
        break;
      case "Home":
        event.preventDefault();
        move(0);
        break;
      case "End":
        event.preventDefault();
        move(last);
        break;
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className="inline-flex h-8 items-center gap-0.5 rounded-[12px] bg-subtle p-0.5"
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => !disabled && onChange(option.value)}
            onKeyDown={(event) => !disabled && onKeyDown(event, index)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-sm px-2.5 text-caption transition-colors duration-[160ms]",
              selected
                ? "bg-segment-active font-semibold text-primary shadow-xs"
                : "text-secondary hover:text-primary",
            )}
          >
            {option.label}
            <span className={cn("font-mono text-mono", selected ? "text-secondary" : "text-tertiary")}>
              {option.count ?? "·"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
