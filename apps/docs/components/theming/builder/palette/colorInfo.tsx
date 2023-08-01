import { useContext } from "react";
import { PaletteContext } from "@/components/theming/builder/palette/paletteContext";

export const ActiveColorInfo = () => {
  const { currentColorPalette } = useContext(PaletteContext);

  return (
    <div className={"flex flex-col items-center justify-center h-full"}>
      <div
        className={"w-[100px] h-[100px] rounded-2xl"}
        style={{ backgroundColor: currentColorPalette?.color.color }}
      />
      <div className={"py-4 text-3xl"}>{currentColorPalette?.cssVarName}</div>
    </div>
  );
};
