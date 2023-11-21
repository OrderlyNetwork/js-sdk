import { FC, useMemo } from "react";
import { cn } from "@/utils/css";

interface CellBarProps {
  width: number;
  className?: string;
}

export const CellBar: FC<CellBarProps> = (props) => {
  const transform = useMemo(() => {
    const x = Math.max(props.width, 1);
    return { transform: `translateX(-${x}%)` };
  }, [props.width]);

  return (
    <div
      className={cn(
        "absolute right-[-100%] top-0 h-full w-full transition-transform pointer-events-none",
        props.className
      )}
      style={transform}
    />
  );
};
