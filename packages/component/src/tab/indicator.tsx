import { cx } from "class-variance-authority";
import { FC, useMemo } from "react";
import { twMerge } from "tailwind-merge";

export interface TabIndicatorProps {
  left?: number;
  width?: number;
  color?: string;
  className?: string;
}

export const TabIndicator: FC<TabIndicatorProps> = ({
  left = 0,
  width = 30,
  className,
}) => {
  const cssTransform = useMemo(() => {
    return { transform: `translateX(${left}px)`, width: `${width}px` };
  }, [left]);

  return (
    <div
      className={twMerge(
        cx(
          "absolute bottom-0 left-0 h-[3px] bg-slate-500 transition-transform",
          className
        )
      )}
      style={cssTransform}
    />
  );
};
