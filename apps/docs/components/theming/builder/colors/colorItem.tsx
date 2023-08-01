import { FC, useMemo } from "react";
import clsx from "clsx";
import { Tooltip } from "@douyinfe/semi-ui";
import { getContrastYIQ } from "@/helper/color";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  color: string;
  name: string;
  isPrimary?: boolean;
}

export const ColorItem: FC<Props> = (props) => {
  const textColor = useMemo(
    () => getContrastYIQ(props.color.replace("#", "")),
    [props.color]
  );
  return (
    <Tooltip content={props.color}>
      <div
        className={clsx(
          "w-[50px] h-[50px] hover:scale-125 text-sm flex justify-center items-center",
          props.isPrimary && "rounded-full"
        )}
        style={{ backgroundColor: props.color, color: textColor }}
      >
        {props.name}
      </div>
    </Tooltip>
  );
};
