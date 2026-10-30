import { Divider, cn } from "@orderly.network/ui";

export function AnnouncementDetailSkeleton({
  className,
}: { className?: string } = {}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "oui-notification-announcementDetailSkeleton oui-animate-pulse motion-reduce:oui-animate-none",
        className,
      )}
    >
      <div className="oui-notification-sourceBadge-slot oui-mb-4 oui-h-5 oui-w-16 oui-rounded oui-bg-base-6" />
      <div className="oui-h-9 oui-w-5/6 oui-rounded oui-bg-base-8" />
      <div className="oui-mb-8 oui-mt-4 oui-h-4 oui-w-52 oui-max-w-full oui-rounded oui-bg-base-6" />
      <Divider intensity={6} />
      <div className="oui-mt-8 oui-space-y-8">
        {["oui-w-3/4", "oui-w-2/3", "oui-w-1/2"].map((lastLineWidth, index) => (
          <div key={lastLineWidth} className="oui-space-y-3">
            {index === 1 && (
              <div className="oui-mb-4 oui-h-6 oui-w-1/3 oui-rounded oui-bg-base-8" />
            )}
            <div className="oui-h-4 oui-w-full oui-rounded oui-bg-base-6" />
            <div className="oui-h-4 oui-w-11/12 oui-rounded oui-bg-base-6" />
            <div
              className={cn("oui-h-4 oui-rounded oui-bg-base-6", lastLineWidth)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
