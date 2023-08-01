"use client";

import { TabPane, Tabs } from "@douyinfe/semi-ui";
import { PaletteEditor } from "../../../../../components/theming/builder/palette";
import { Colors } from "@/components/theming/builder/colors";
import { TabName } from "@/components/theming/tabName";
import { TypographyEditor } from "@/components/theming/builder/typography";
import { RoundedEditor } from "@/components/theming/builder/rounded";
import { SpacingEditor } from "@/components/theming/builder/spacing";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <Tabs
      tabPosition={"left"}
      type={"button"}
      tabPaneMotion={false}
      lazyRender
      keepDOM={false}
    >
      <TabPane tab={<TabName name={"Colors"} />} itemKey={"colors"}>
        <Colors />
      </TabPane>
      <TabPane tab={<TabName name={"palette"} />} itemKey={"palette"}>
        <PaletteEditor />
      </TabPane>
      <TabPane tab={"Typography"} itemKey={"typography"}>
        <TypographyEditor />
      </TabPane>
      <TabPane tab={"Rounded"} itemKey={"rounded"}>
        <RoundedEditor />
      </TabPane>
      <TabPane tab={"Spacing"} itemKey={"spacing"}>
        <SpacingEditor />
      </TabPane>
      <TabPane tab={"Shadow"} itemKey={"shadow"}>
        Colors
      </TabPane>
    </Tabs>
  );
}
