import { FC, useMemo } from "react";
import { cn } from "@/utils/css";

export enum CellBarDirection {
  LEFT_TO_RIGHT,
  RIGHT_TO_LEFT,
}

interface CellBarProps {
  width: number;
  className?: string;
  direction?: CellBarDirection
}

export const CellBar: FC<CellBarProps> = (props) => {
  const { direction = CellBarDirection.RIGHT_TO_LEFT } = props;
  const transform = useMemo(() => {
    const x = Math.max(props.width, 0);
    if (direction === CellBarDirection.LEFT_TO_RIGHT) {
      return { transform: `translateX(${x}%)` };
    }
    return { transform: `translateX(-${x}%)` };
    
  }, [props.width]);

  return (
    <div
      className={cn(
        "orderly-absolute orderly-right-[-100%] orderly-top-0 orderly-h-full orderly-w-full orderly-transition-transform orderly-pointer-events-none",
        direction === CellBarDirection.LEFT_TO_RIGHT && "orderly-left-[-100%]",
        props.className
      )}
      style={transform}
    />
  );
};
