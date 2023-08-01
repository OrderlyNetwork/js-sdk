"use client";

import { ColorPalette } from "@/components/theming/builder/palette/colorPalette";
import { TabPane, Tabs } from "@douyinfe/semi-ui";
import { ActiveColorInfo } from "@/components/theming/builder/palette/colorInfo";
import { CustomColor } from "@/components/theming/builder/palette/customColor";
import { trpc } from "@/utils/trpc";
import { useCallback, useContext } from "react";
import { PaletteContext } from "@/components/theming/builder/palette/paletteContext";
import { ThemeContext } from "@/components/theming/themeContext";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

export const PaletteSelector = () => {
  const queryClient = useQueryClient();

  const updatePalette = trpc.theme.updatePalette.useMutation();
  const { theme } = useContext(ThemeContext);
  const { currentColorPalette, colorPalette } = useContext(PaletteContext);

  const onColorChange = useCallback((colorValue: string, name: string) => {
    if (!currentColorPalette) return;
    const newValue = colorPalette.map((item: any) => {
      if (item.groupName === currentColorPalette?.groupName) {
        return {
          ...item,
          colors: item.colors.map((color: any) => {
            if (color.name === currentColorPalette?.color.name) {
              return {
                ...color,
                color: colorValue,
                reference: name,
              };
            }
            return color;
          }),
        };
      }
      return item;
    });
    updatePalette.mutate(
      {
        id: theme.id,
        palette: newValue,
      },
      {
        onSuccess: (data, variables) => {
          const themeQueryKey = getQueryKey(trpc.theme.byId, {
            id: theme.id,
          });

          console.log("themeQueryKey", themeQueryKey);
          console.log(data, variables);
          queryClient.setQueryData(themeQueryKey, data);
        },
      }
    );
  }, []);

  return (
    <div className={"flex flex-col h-full"}>
      <div className={"py-5"}>
        <ActiveColorInfo />
      </div>
      <div className={"border-t border-solid border-slate-200"}>
        <Tabs>
          <TabPane tab={"Color palette"} itemKey={"palette"}>
            <ColorPalette onColorChange={onColorChange} />
          </TabPane>
          <TabPane tab={"Custom Color"} itemKey={"custom"}>
            <CustomColor onColorChange={onColorChange} />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};
