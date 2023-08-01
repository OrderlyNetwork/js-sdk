import { GroupItem } from "@/components/theming/builder/palette/groupItem";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  ActiveColor,
  PaletteContext,
} from "@/components/theming/builder/palette/paletteContext";
import { Collapse, SideSheet } from "@douyinfe/semi-ui";
import { PaletteSelector } from "./selector";

export const ColorPaletteListView = () => {
  const [visible, setVisible] = useState(false);
  const { setCurrentColorPalette, currentColorPalette, colorPalette } =
    useContext(PaletteContext);

  const onItemClick = useCallback((item: ActiveColor) => {
    setCurrentColorPalette(item);
    setVisible(true);
  }, []);

  const onClose = useCallback(() => {
    setVisible(false);
    setCurrentColorPalette(null);
  }, []);

  const getContainer = () => {
    return document.getElementById("previewBox");
  };

  useEffect(() => {
    return () => {
      setCurrentColorPalette(null);
      setVisible(false);
    };
  }, []);

  return (
    <>
      <Collapse>
        {colorPalette.map((item) => {
          return (
            <GroupItem
              key={item.groupName}
              groupName={item.groupName}
              items={item.colors}
              onClick={onItemClick}
              selectColor={currentColorPalette}
            />
          );
        })}
      </Collapse>
      <SideSheet
        title="Colors"
        visible={visible}
        onCancel={onClose}
        width={391}
        placement="left"
        getPopupContainer={getContainer}
      >
        <PaletteSelector />
      </SideSheet>
    </>
  );
};
