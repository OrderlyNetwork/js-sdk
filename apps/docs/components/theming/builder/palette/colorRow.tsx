import React, { FC } from "react";
import { ColorItem } from "./colorItem";

interface ColorRowProps {
  colors: string[];
  name: string;
  onColorClick: (name: string, color: string) => void;
}

export const ColorRow: FC<ColorRowProps> = (props) => {
  return (
    <div>
      {/*<div className={"py-2"}>{props.name}</div>*/}
      <div className={"flex"}>
        {props.colors.map((color, index) => {
          return (
            <ColorItem
              color={color}
              key={index}
              onColorClick={props.onColorClick}
            />
          );
        })}
      </div>
    </div>
  );
};
