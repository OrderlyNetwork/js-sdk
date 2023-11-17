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
        "orderly-absolute orderly-right-[-100%] orderly-top-0 orderly-h-full orderly-w-full orderly-transition-transform orderly-pointer-events-none",
        props.className
      )}
      style={transform}
    />
  );
};
