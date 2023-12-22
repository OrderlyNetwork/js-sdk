import { Collapse } from "@orderly.network/react";
import { EditorHeader } from "@/components/theming/editor/header";
import { SectionPane } from "./sectionPane";
import { Colors } from "./colors";
import { Rounded } from "./rounded";
import { Typography } from "./typography";

export const ThemeEditor = () => {
  return (
    <div className="z-30 w-[340px] rounded-xl bg-neutral-900 sticky top-[80px]">
      <EditorHeader />
      <div className="px-5 text-sm text-neutral-400">
        <Collapse activeKey="colors">
          <Collapse.panel header="Colors" itemKey="colors">
            <Colors />
          </Collapse.panel>
          <Collapse.panel header="Rounded(px)" itemKey="rounded">
            <Rounded />
          </Collapse.panel>
          <Collapse.panel header="Typography" itemKey="typography">
            <Typography />
          </Collapse.panel>
        </Collapse>
      </div>
      <div className="pb-5" />
    </div>
  );
};
