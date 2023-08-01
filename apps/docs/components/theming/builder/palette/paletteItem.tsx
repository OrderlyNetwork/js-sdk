import { FC, useMemo } from "react";
import clsx from "clsx";
import { ActiveColor } from "@/components/theming/builder/palette/paletteContext";

interface Props {
  color: string;
  name: string;
  groupName: string;
  active?: boolean;
  reference?: string;

  onClick?: (color: ActiveColor) => void;
}

export const PaletteItem: FC<Props> = ({
  color,
  name,
  reference,
  groupName,
  onClick,
  active,
}) => {
  const cssVarName = useMemo(() => {
    return `${groupName}${name === "default" ? "" : `-${name}`}`;
  }, [name, groupName]);

  return (
    <div
      onClick={() => {
        onClick?.({
          color: {
            name,
            color,
            reference,
          },
          groupName,
          cssVarName,
        });
      }}
      className={clsx(
        "py-2 pl-2 rounded cursor-pointer text-sm flex items-center",
        active && "outline outline-3 outline-blue-500 border-transparent"
      )}
    >
      <div
        className={"w-8 h-8 rounded-full shadow"}
        style={{ backgroundColor: color }}
      />
      <div className={"ml-3 text-slate-700"}>{cssVarName}</div>
    </div>
  );
};
