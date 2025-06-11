import { FC } from "react";
import { cn } from "@orderly.network/ui";

export interface TimelinePoint {
  title: string;
  type: "past" | "active" | "future";
  time: string;
}

export interface CampaignsAxisProps {
  points: TimelinePoint[];
}

export const CampaignsAxis: FC<CampaignsAxisProps> = ({ points }) => {
  if (!points || points.length === 0) {
    return null;
  }

  // Find the index of the active point
  const activeIndex = points.findIndex((point) => point.type === "active");

  // For single point, center it without any lines
  if (points.length === 1) {
    return (
      <div className="oui-w-full oui-flex oui-justify-center">
        <div className="oui-flex oui-flex-col oui-items-center">
          <AxisPoint type={points[0].type} />
          <div className="oui-flex oui-flex-col oui-items-center oui-text-center oui-mt-4">
            <div className="oui-trading-leaderboard-title oui-text-sm oui-font-medium oui-text-base-contrast-54 oui-mb-1 oui-whitespace-nowrap">
              {points[0].title}
            </div>
            <div className="oui-text-xs oui-text-base-contrast-36 oui-whitespace-nowrap">
              {points[0].time}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to determine line background class
  const getLineBackgroundClass = (segmentIndex: number): string => {
    // If there's an active point and this segment is to the left of it, use oui-bg-base-3
    if (activeIndex !== -1 && segmentIndex < activeIndex) {
      return "oui-bg-base-3";
    }
    // Otherwise use regular color
    return "oui-bg-base-8";
  };

  const widthPercentage = points?.length > 3 ? "110%" : "120%";

  return (
    <div className="oui-w-full oui-flex" style={{ width: widthPercentage }}>
      {points.map((point, index) => {
        const isFirst = index === 0;
        const isLast = index === points.length - 1;

        return (
          <div
            key={index}
            className="oui-flex-1 oui-flex oui-flex-col oui-items-center oui-relative"
          >
            {/* Point container with connecting lines */}
            <div className="oui-relative oui-flex oui-items-center oui-w-full">
              {/* Left line - always occupy space, but invisible for first point */}
              <div
                className={cn([
                  "oui-flex-1 oui-h-[6px]",
                  !isFirst && getLineBackgroundClass(index - 1),
                ])}
              />

              {/* Point */}
              <div className="oui-flex-shrink-0 oui-z-10">
                <AxisPoint type={point.type} />
              </div>

              {/* Right line - always occupy space, but invisible for last point */}
              <div
                className={cn([
                  "oui-flex-1 oui-h-[6px]",
                  !isLast && getLineBackgroundClass(index),
                ])}
              />
            </div>

            {/* Label below point */}
            <div className="oui-flex oui-flex-col oui-items-center oui-text-center oui-mt-4">
              <div className="oui-trading-leaderboard-title oui-text-sm oui-font-medium oui-text-base-contrast-54 oui-mb-1 oui-whitespace-nowrap">
                {point.title}
              </div>
              <div className="oui-text-xs oui-text-base-contrast-36 oui-whitespace-nowrap">
                {point.type !== "active" && point.time}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AxisPoint: FC<{ type: "past" | "active" | "future" }> = ({ type }) => {
  return (
    <div
      className={cn([
        "oui-w-5 oui-h-5 oui-rounded-full oui-flex-shrink-0",
        type === "past" && "oui-bg-base-contrast-80",
        type === "active" &&
          "oui-bg-gradient-to-r oui-from-[rgba(var(--oui-gradient-brand-start))] oui-to-[rgba(var(--oui-gradient-brand-end))]",
        type === "future" &&
          "oui-bg-[#07080A] oui-border-[2.5px] oui-border-solid oui-border-base-contrast-80",
      ])}
    />
  );
};
