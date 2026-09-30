import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { TaskStatus } from "@/api/types";
import { PAGE_SIZE } from "@/features/tasks/queries";
import { STATUS_LABEL } from "@/lib/vocab";

const AnnounceContext = createContext<((message: string) => void) | null>(null);

/** DESIGN 8.4: one polite status region, mounted once at the app root. */
export function LiveRegionProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const announce = useCallback((next: string) => setMessage(next), []);
  const value = useMemo(() => announce, [announce]);

  return (
    <AnnounceContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" className="sr-only">
        {message}
      </div>
    </AnnounceContext.Provider>
  );
}

export function useAnnounce() {
  const announce = useContext(AnnounceContext);
  if (!announce) throw new Error("useAnnounce must be used inside LiveRegionProvider");
  return announce;
}

/** DESIGN 8.4. Returns "" when there is nothing worth saying. */
export function listAnnouncement({
  isLoading,
  count,
  status,
  page,
}: {
  isLoading: boolean;
  count: number;
  status: TaskStatus | null;
  page: number;
}): string {
  if (isLoading) return "Loading tasks";

  if (page > 1) {
    const first = (page - 1) * PAGE_SIZE + 1;
    return `Page ${page}, tasks ${first} to ${first + count - 1}`;
  }

  if (count === 0) return status ? "No tasks match this filter" : "";

  const label = status ? STATUS_LABEL[status] : "All";
  return `${count} task${count === 1 ? "" : "s"} shown, ${label}`;
}
