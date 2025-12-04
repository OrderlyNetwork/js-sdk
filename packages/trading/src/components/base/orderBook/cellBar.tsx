import { cn } from "@veltodefi/ui";
import { FC, useMemo } from "react";

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
        "oui-absolute oui-right-[-100%] oui-top-0 oui-h-full oui-w-full oui-transition-transform oui-pointer-events-none",
        direction === CellBarDirection.LEFT_TO_RIGHT && "oui-left-[-100%]",
        props.className
      )}
      style={transform}
    />
  );
};
