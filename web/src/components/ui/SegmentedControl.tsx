import { useLayoutEffect, useRef, useState } from "react";

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
  const trackRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const selectedIndex = options.findIndex((o) => o.value === value);

  useLayoutEffect(() => {
    const el = refs.current[selectedIndex];
    const track = trackRef.current;
    if (!el || !track) return;
    const t = track.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setIndicator({ left: r.left - t.left, width: r.width });
  }, [selectedIndex, options]);

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
      ref={trackRef}
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className="relative inline-flex h-8 items-center gap-0.5 rounded-[12px] bg-subtle p-0.5"
    >
      {indicator ? (
        <span
          aria-hidden
          style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
          className="absolute left-0 top-0.5 h-7 rounded-sm bg-segment-active shadow-xs
                     transition-[transform,width] duration-[160ms] ease-[cubic-bezier(0.2,0,0,1)]
                     motion-reduce:transition-none"
        />
      ) : null}
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
              "relative z-10 inline-flex h-7 items-center gap-1.5 rounded-sm px-2.5 text-caption transition-colors duration-[160ms]",
              selected ? "font-semibold text-primary" : "text-secondary hover:text-primary",
            )}
          >
            {option.label}
            <span className={cn("text-caption tabular-nums", selected ? "text-secondary" : "text-tertiary")}>
              {option.count ?? "·"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
