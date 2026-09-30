import { cn } from "@/lib/cn";

export const Skeleton = ({ className }: { className?: string }) => (
  <div aria-hidden className={cn("animate-pulse bg-muted", className)} />
);

/** Width varies per skeleton row (DESIGN 4.14), so it is an inline style, not a class. */
export const SkeletonLine = ({
  width,
  height = 12,
}: {
  width: number | string;
  height?: number;
}) => <div aria-hidden style={{ width, height }} className="animate-pulse rounded-full bg-muted" />;
