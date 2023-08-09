"use client";
import { TabPane, Tabs } from "@douyinfe/semi-ui";
import { TabName } from "@/components/theming/tabName";
import { LogoConfig } from "@/components/theming/builder/baseConfig/logo";
import { IconsConfig } from "@/components/theming/builder/baseConfig/icons";

export default function Page() {
  return (
    <div>
      <Tabs
        tabPosition={"left"}
        type={"button"}
        tabPaneMotion={false}
        lazyRender
        keepDOM={false}
      >
        <TabPane tab={<TabName name={"Logo"} />} itemKey={"logo"}>
          <LogoConfig />
        </TabPane>
        <TabPane tab={<TabName name={"Icon"} />} itemKey={"icons"}>
          <IconsConfig />
        </TabPane>
      </Tabs>
    </div>
  );
}
