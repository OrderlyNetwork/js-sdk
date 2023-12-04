import { EditorHeader } from "@/components/theming/editor/header";
import { SectionPane } from "./sectionPane";
import { Colors } from "./colors";
import { Rounded } from "./rounded";
import { Typography } from "./typography";

export const ThemeEditor = () => {
  return (
    <div className="shadow-lg z-30 w-[380px] rounded-xl bg-base-800 sticky top-[80px]">
      <EditorHeader />
      <div>
        <SectionPane title="Colors">
          <Colors />
        </SectionPane>
        <SectionPane title="Rounded(px)">
          <Rounded />
        </SectionPane>
        <SectionPane title="Typography">
          <Typography />
        </SectionPane>
      </div>
    </div>
  );
};
