import { ColorPicker, useColor, toColor, Color } from "react-color-palette";
import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PaletteContext } from "@/components/theming/builder/palette/paletteContext";

interface Props {
  onColorChange: (colorValue: string, name: string) => void;
}

export const CustomColor: FC<Props> = (props) => {
  const [color, setColor] = useColor("hex", "#121212");
  const { currentColorPalette } = useContext(PaletteContext);
  // const [color, setColor] = useState("#aabbcc");

  useEffect(() => {
    if (!currentColorPalette) return;
    setColor(toColor("hex", currentColorPalette.color.color));
  }, [currentColorPalette]);

  const onColorChange = useCallback((color: Color) => {
    // console.log("color =====>>>>", color);
    props.onColorChange(color.hex, "");
  }, []);

  return (
    <div className={"flex flex-col items-center py-5"}>
      <ColorPicker
        width={300}
        height={228}
        color={color}
        onChange={setColor}
        onChangeComplete={onColorChange}
        // hideHEX
        hideHSV
        hideRGB
      />
    </div>
  );
};
