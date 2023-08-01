import { ColorRow } from "./colorRow";
import {
  BRAND_COLORS,
  COLORS,
  COLORS_NAME,
} from "@/components/theming/builder/colors/colors";
import React, { FC, useContext, useMemo } from "react";
import { ColorItem } from "@/components/theming/builder/palette/colorItem";
import { ColorContext } from "@/components/theming/builder/colors/colorContext";
import { PaletteContext } from "@/components/theming/builder/palette/paletteContext";
import { trpc } from "@/utils/trpc";
import { ThemeContext } from "@/components/theming/themeContext";

interface Props {
  onColorChange: (colorValue: string, name: string) => void;
}

export const ColorPalette: FC<Props> = (props) => {
  const { updateCurrentColorPalette, currentColorPalette, colorPalette } =
    useContext(PaletteContext);
  const { theme } = useContext(ThemeContext);

  // generate the color palette
  const colors = useMemo(() => {
    const colors = [];
    for (let i = 0; i < COLORS.length; i++) {
      const group = COLORS[i];
      for (let j = 0; j < group.colors.length; j++) {
        const color = group.colors[j];
        colors.push({
          color,
          name: `${group.groupName.toLowerCase()}-${COLORS_NAME[j]}`,
        });
      }
    }

    return [
      ...BRAND_COLORS.map((item, index) => ({
        color: item,
        name: `brand-${item}-${COLORS_NAME[index]}`,
      })),
      ...colors,
    ];
  }, []);

  return (
    <div className={"py-5"}>
      {/*<div>Available Colors</div>*/}
      <div className={"flex gap-1 flex-wrap"}>
        {colors.map((color, index) => {
          return (
            <ColorItem
              color={color.color}
              key={index}
              name={color.name}
              active={
                !!currentColorPalette &&
                currentColorPalette.color.reference === color.name
              }
              onColorClick={(colorValue, name) => {
                props.onColorChange(colorValue, name);
                // if (!currentColorPalette) return;
                // const newValue = colorPalette.map((item: any) => {
                //   if (item.groupName === currentColorPalette?.groupName) {
                //     return {
                //       ...item,
                //       colors: item.colors.map((color: any) => {
                //         if (color.name === currentColorPalette?.color.name) {
                //           return {
                //             ...color,
                //             color: colorValue,
                //             reference: name,
                //           };
                //         }
                //         return color;
                //       }),
                //     };
                //   }
                //   return item;
                // });
                // updatePalette.mutate({
                //   id: theme.id,
                //   palette: newValue,
                // });
                // updateCurrentColorPalette(color, name);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
