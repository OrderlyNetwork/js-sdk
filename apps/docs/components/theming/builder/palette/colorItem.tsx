import { FC } from "react";
import { Tooltip } from "@douyinfe/semi-ui";
import clsx from "clsx";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  color: string;
  name: string;
  onColorClick: (name: string, color: string) => void;
  active: boolean;
}

export const ColorItem: FC<Props> = (props) => {
  return (
    <Tooltip content={props.color}>
      <div
        className={clsx(
          "w-10 h-10 cursor-pointer hover:scale-125 hover:rounded hover:shadow",
          props.active && "rounded-full"
        )}
        style={{ backgroundColor: props.color }}
        onClick={() => {
          props.onColorClick(props.color, props.name);
        }}
      ></div>
    </Tooltip>
  );
};
