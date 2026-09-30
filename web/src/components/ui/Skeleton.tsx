import { cn } from "@/lib/cn";

export const Skeleton = ({ className }: { className?: string }) => (
  <div aria-hidden data-motion="skeleton" className={cn("animate-skeleton-pulse bg-muted", className)} />
);

/** Width varies per skeleton row (DESIGN 4.14), so it is an inline style, not a class. */
export const SkeletonLine = ({
  width,
  height = 12,
}: {
  width: number | string;
  height?: number;
}) => <div aria-hidden data-motion="skeleton" style={{ width, height }} className="animate-skeleton-pulse rounded-full bg-muted" />;
