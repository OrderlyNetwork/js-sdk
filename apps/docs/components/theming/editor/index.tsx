import { EditorHeader } from "@/components/theming/editor/header";
import { SectionPane } from "./sectionPane";
import { Colors } from "./colors";
import { Rounded } from "./rounded";

export const ThemeEditor = () => {
  return (
    <div className="shadow-lg z-30 w-[380px] rounded-lg bg-base-800 sticky top-[80px]">
      <EditorHeader />
      <div>
        <SectionPane title="Colors">
          <Colors />
        </SectionPane>
        <SectionPane title="Rounded">
          <Rounded />
        </SectionPane>
      </div>
    </div>
  );
};
