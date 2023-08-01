import React from "react";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/lib/css/styles.css";

export const ColorEditor = () => {
  const [color, setColor] = useColor("hex", "#121212");
  return (
    <div className={"flex justify-end p-5 bg-slate-200"}>
      <ColorPicker
        width={250}
        height={228}
        color={color}
        onChange={setColor}
        hideHSV
      />
    </div>
  );
};
