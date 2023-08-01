import React, { useContext, useEffect } from "react";
import { ColorRow } from "./colorRow";
import {
  BRAND_COLORS,
  COLORS,
} from "@/components/theming/builder/colors/colors";
import { ColorToolbar } from "./toolbar";
import { ColorEditor } from "./colorEditor";
import { ColorContext, ColorProvider } from "./colorContext";

export const Colors = () => {
  return (
    <ColorProvider>
      <div className={"flex"}>
        {/*<ColorVars />*/}
        <div className={"flex-1"}>
          <ColorRow colors={BRAND_COLORS} name={"Brand"} />
          <div className={"mt-5"}>
            <ColorToolbar />
          </div>
          {COLORS.map((item, index) => {
            return (
              <ColorRow
                colors={item.colors}
                key={index}
                name={item.groupName}
              />
            );
          })}
        </div>
        {/*<div className={"w-[280px]"}>*/}
        {/*  <ColorEditor />*/}
        {/*</div>*/}
      </div>
    </ColorProvider>
  );
};
