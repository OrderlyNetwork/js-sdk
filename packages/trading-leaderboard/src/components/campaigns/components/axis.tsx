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

  // For single point, center it
  if (points.length === 1) {
    return (
      <div className="oui-w-full oui-flex oui-flex-col oui-items-center oui-justify-center">
        <AxisPoint type={points[0].type} />
        <div className="oui-flex oui-flex-col oui-items-center oui-text-center oui-mt-4">
          <div className="oui-text-sm oui-font-medium oui-text-base-contrast-100 oui-mb-1 oui-whitespace-nowrap">
            {points[0].title}
          </div>
          <div className="oui-text-xs oui-text-base-contrast-80 oui-whitespace-nowrap">
            {points[0].time}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="oui-w-full oui-flex oui-flex-col oui-items-center oui-justify-center">
      {/* Timeline points and connecting lines */}
      <div className="oui-w-full oui-flex oui-items-center oui-relative">
        {/* Continuous line background */}
        <div className="oui-absolute oui-left-16 oui-right-16 oui-h-[2px] oui-bg-base-contrast-80" />

        {/* Points container with equal spacing */}
        <div className="oui-w-full oui-flex oui-items-center oui-relative">
          {/* Left spacer */}
          <div className="oui-flex-1" />

          {points.map((point, index) => {
            const isLast = index === points.length - 1;

            return (
              <div key={index} className="oui-flex oui-items-center oui-flex-1">
                {/* Point */}
                <div className="oui-flex oui-justify-center oui-relative oui-z-10 oui-w-full">
                  <AxisPoint type={point.type} />
                </div>
              </div>
            );
          })}

          {/* Right spacer */}
          <div className="oui-flex-1" />
        </div>
      </div>

      {/* Labels below points */}
      <div className="oui-w-full oui-flex oui-items-center oui-mt-4">
        {/* Left spacer */}
        <div className="oui-flex-1" />

        {points.map((point, index) => {
          return (
            <div key={index} className="oui-flex oui-items-center oui-flex-1">
              {/* Label */}
              <div className="oui-flex oui-justify-center oui-w-full">
                <div className="oui-flex oui-flex-col oui-items-center oui-text-center">
                  <div className="oui-text-sm oui-font-medium oui-text-base-contrast-54 oui-mb-1 oui-whitespace-nowrap">
                    {point.title}
                  </div>
                  <div className="oui-text-xs oui-text-base-contrast-36 oui-whitespace-nowrap">
                    {point.time}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Right spacer */}
        <div className="oui-flex-1" />
      </div>
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
