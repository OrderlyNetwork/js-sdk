import { cn } from "@orderly.network/ui";

export function AnnouncementListSkeleton({
  compact = false,
  showSourceBadge = true,
}: {
  compact?: boolean;
  showSourceBadge?: boolean;
}) {
  const titleWidths = compact
    ? ["oui-w-5/6", "oui-w-2/3", "oui-w-3/4"]
    : ["oui-w-3/4", "oui-w-5/6", "oui-w-2/3", "oui-w-4/5", "oui-w-3/5"];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "oui-animate-pulse motion-reduce:oui-animate-none",
        compact ? "oui-space-y-1" : "oui-divide-y oui-divide-line-6",
      )}
    >
      {titleWidths.map((width, index) => (
        <div
          key={index}
          className={cn(
            "oui-flex oui-flex-col",
            compact
              ? "oui-gap-1 oui-px-2 oui-py-3"
              : "oui-gap-3 oui-px-0 oui-py-4 lg:oui-px-3 lg:oui-py-6",
          )}
        >
          {showSourceBadge && (
            <div
              className={cn(
                "oui-w-16 oui-rounded oui-bg-base-6",
                compact ? "oui-h-5" : "oui-h-[18px]",
              )}
            />
          )}
          <div
            className={cn(
              "oui-rounded oui-bg-base-8",
              compact ? "oui-h-4" : "oui-h-6 oui-max-w-xl",
              width,
            )}
          />
          <div
            className={cn(
              "oui-rounded oui-bg-base-6",
              compact ? "oui-h-3 oui-w-28" : "oui-h-5 oui-w-44 oui-max-w-full",
            )}
          />
        </div>
      ))}
    </div>
  );
}
