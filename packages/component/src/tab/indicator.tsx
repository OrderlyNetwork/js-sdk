import { FC, useMemo } from "react";
import { cn } from "@/utils/css";

export interface TabIndicatorProps {
  left?: number;
  width?: number;
  color?: string;
  className?: string;
}

export const TabIndicator: FC<TabIndicatorProps> = ({
  left = 0,
  width = 40,
  className,
}) => {
  const cssTransform = useMemo(() => {
    return { transform: `translateX(${left}px)`, width: `${width}px` };
  }, [left, width]);

  return (
    <div
      className={cn(
        "orderly-absolute orderly-bottom-0 orderly-left-0 orderly-h-[3px] md:orderly-h-[2px] orderly-bg-base-contrast orderly-transition-transform",
        className
      )}
      style={cssTransform}
    />
  );
};
