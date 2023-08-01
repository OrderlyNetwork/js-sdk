import { ColorPaletteListView } from "@/components/theming/builder/palette/listView";
import { PaletteSelector } from "@/components/theming/builder/palette/selector";
import { PaletteProvider } from "@/components/theming/builder/palette/paletteContext";
import { Layout } from "@douyinfe/semi-ui";
import { COLOR_PALETTE } from "@/components/theming/constants/colorPalette";
import { GroupItem } from "@/components/theming/builder/palette/groupItem";

export const PaletteEditor = () => {
  return (
    <PaletteProvider>
      <div className={"flex"}>
        <div
          className={
            "w-[280px] h-[calc(100vh_-_40px)] border-0 border-r-[1px] border-solid border-slate-200 overflow-auto"
          }
        >
          <ColorPaletteListView />
        </div>
        {/*<div className={"flex-1"}>*/}
        {/*  <PaletteSelector />*/}
        {/*</div>*/}
      </div>
    </PaletteProvider>
  );
};
