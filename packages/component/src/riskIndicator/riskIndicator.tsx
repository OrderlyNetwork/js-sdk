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
      className="flex justify-center items-end"
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
          "relative w-[2px] h-[2px] rounded-full bg-white after:block after:content-[''] after:absolute after:right-0 after:w-[10px] after:h-[2px] after:bg-white/50",
          {
            // 'rotate-0': value >= 10,
            "rotate-90": value >= 0.5 && value < 10,
            "rotate-180": value < 0.5,
          }
        )}
      ></div>
    </div>
  );
};
