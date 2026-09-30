import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/Button";

import { PAGE_SIZE } from "./queries";

export function Pagination({
  page,
  hasNext,
  count,
  onPrevious,
  onNext,
  loading = false,
}: {
  page: number;
  hasNext: boolean;
  count: number;
  onPrevious: () => void;
  onNext: () => void;
  loading?: boolean;
}) {
  // DESIGN 4.15: when the whole result fits one page, the control is not rendered.
  if (page === 1 && !hasNext && count < PAGE_SIZE) return null;

  const first = page === 1;

  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-end gap-3">
      <span className="font-mono text-mono text-secondary">PAGE {page}</span>
      {/* DESIGN 4.15: 12px between the label and Previous, 8px between Previous and Next. */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          leadingIcon={ChevronLeft}
          disabled={first}
          loading={loading && !first}
          onClick={first ? undefined : onPrevious}
        >
          Previous
        </Button>
        <Button
          size="sm"
          disabled={!hasNext}
          title={hasNext ? undefined : "You're on the last page"}
          onClick={hasNext ? onNext : undefined}
        >
          Next
          <ChevronRight aria-hidden className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
    </nav>
  );
}
