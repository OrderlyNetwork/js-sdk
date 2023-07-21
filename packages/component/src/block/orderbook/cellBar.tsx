import { FC, useMemo } from "react";

interface CellBarProps {
  width: number;
}

export const CellBar: FC<CellBarProps> = (props) => {
  const transform = useMemo(
    () => ({ transform: `translateX(${props.width}%)` }),
    [props.width]
  );

  return (
    <div
      className="absolute left-0 top-0 h-full w-full bg-red-500/25"
      style={transform}
    />
  );
};
