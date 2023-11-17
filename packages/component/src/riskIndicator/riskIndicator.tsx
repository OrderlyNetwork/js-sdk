import { cn } from "@/utils/css";
import { FC } from "react";

interface RiskIndicatorProps {
  value: number;
  size?: number;
}

export const RiskIndicator: FC<RiskIndicatorProps> = (props) => {
  const { size = 20, value } = props;

  return (
    <div
      className="orderly-flex orderly-justify-center orderly-items-end"
      style={{
        background: "url(/images/riskLevelBg.png)",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center bottom",
        width: `${size}px`,
        height: `14px`,
      }}
    >
      <div
        className={cn(
          "orderly-relative orderly-w-[2px] orderly-h-[2px] orderly-rounded-full orderly-bg-white after:orderly-block after:orderly-content-[''] after:orderly-absolute after:orderly-right-0 after:orderly-w-[10px] after:orderly-h-[2px] after:orderly-bg-white/50",
          {
            "orderly-rotate-0": value > 1,
            "orderly-rotate-90": value >= 0.05 && value <= 1,
            "orderly-rotate-180": value < 0.05,
          }
        )}
      ></div>
    </div>
  );
};
