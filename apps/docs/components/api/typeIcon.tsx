import { FC, useMemo } from "react";
import clsx from "clsx";

interface Props {
  type: "I" | "C" | "F" | "E" | "M" | "V" | "T" | "N";
}

export const TypeIcon: FC<Props> = (props) => {
  const { type } = props;

  const className = useMemo(() => {
    switch (type) {
      case "I":
        return "text-blue-500 border-blue-500";
      case "C":
        return "text-green-500 border-green-500";
      case "F":
        return "text-fuchsia-500 border-fuchsia-500";
      case "E":
        return "text-rose-500 border-rose-500";
      case "M":
        return "text-indigo-500 border-indigo-500";
      case "V":
        return "text-indigo-500 border-indigo-500";
      case "T":
        return "text-indigo-500 border-indigo-500";
      case "N":
        return "text-cyan-500 border-cyan-500";
      default:
        return "";
    }
  }, [type]);
  return (
    <span
      className={clsx(
        "inline-block w-[16px] h-[16px] rounded-full border-2 text-[11px] font-bold text-center leading-none",
        className
      )}
    >
      {type}
    </span>
  );
};
