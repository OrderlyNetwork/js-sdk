import { cn } from "@/utils/css";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "orderly-animate-pulse orderly-rounded orderly-bg-base-contrast/10",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
