import { cn } from "@/utils/css";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-base-contrast/10", className)}
      {...props}
    />
  );
}

export { Skeleton };
