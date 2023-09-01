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
  }, [left]);

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 h-[3px] bg-base-contrast transition-transform",
        className
      )}
      style={cssTransform}
    />
  );
};
