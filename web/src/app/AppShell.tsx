import { Check, Monitor, Moon, Plus, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

import { useTheme, type ThemePreference } from "./theme";

const THEME_ICON = { system: Monitor, light: Sun, dark: Moon } as const;

function ThemeToggle() {
  const { theme, resolved, setTheme } = useTheme();
  const order: ThemePreference[] = ["system", "light", "dark"];
  const next = order[(order.indexOf(theme) + 1) % order.length]!;

  return (
    <IconButton
      label="Theme"
      icon={THEME_ICON[resolved === "dark" ? "dark" : "light"]}
      onClick={() => setTheme(next)}
    />
  );
}

export function AppShell({ children, onNewTask }: { children: ReactNode; onNewTask?: () => void }) {
  return (
    <>
      <a
        href="#tasks"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-sm focus:bg-surface focus:px-3 focus:py-2 focus:text-body-strong"
      >
        Skip to tasks
      </a>

      <header className="sticky top-0 z-20 h-14 border-b border-default bg-surface/85 backdrop-blur-[8px] backdrop-saturate-[1.8]">
        <div className="mx-auto flex h-full max-w-[960px] items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-[16px] font-semibold tracking-[-0.03em]">
            <span className="bg-mark grid size-6 place-items-center rounded-xs text-mark-ink">
              <Check aria-hidden className="size-3.5" strokeWidth={2.5} />
            </span>
            Tasks
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <IconButton
              label="New task"
              icon={Plus}
              size="lg"
              onClick={onNewTask}
              className="sm:hidden"
            />
            <Button
              variant="primary"
              mark
              leadingIcon={Plus}
              onClick={onNewTask}
              className="hidden sm:inline-flex"
            >
              New task
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[960px] px-4 pb-16 sm:px-6">
        {children}
        {/* DESIGN 2.15 — the one ornament. Hidden below 768px, where it reads as a smudge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-10 -z-10 hidden select-none font-sans font-semibold leading-none tracking-[-0.05em] text-watermark md:block"
          style={{ fontSize: "clamp(180px, 22vw, 300px)" }}
        >
          Tasks
        </div>
      </main>
    </>
  );
}
