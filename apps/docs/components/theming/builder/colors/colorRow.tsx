import React, { FC, useContext } from "react";
import { ColorItem } from "./colorItem";
import clsx from "clsx";
import { COLORS_NAME } from "@/components/theming/builder/colors/colors";
import { ColorContext } from "@/components/theming/builder/colors/colorContext";

interface ColorRowProps {
  colors: string[];
  name: string;
}

export const ColorRow: FC<ColorRowProps> = (props) => {
  const { setCurrentColor, currentColor } = useContext(ColorContext);
  return (
    <div className={"mb-3 px-3"}>
      <div className={"py-2 font-bold"}>{props.name}</div>
      <div
        className={clsx(
          "inline-flex cursor-pointer",
          currentColor === props.name && "shadow-xl shadow-slate-300"
        )}
        onClick={() => {
          setCurrentColor(currentColor === props.name ? null : props.name);
        }}
      >
        {props.colors.map((color, index) => {
          return (
            <ColorItem
              color={color}
              key={index}
              isPrimary={index === 5 && currentColor === props.name}
              name={COLORS_NAME[index]}
            />
          );
        })}
      </div>
    </div>
  );
};
