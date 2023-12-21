import { PreviewToolbar } from "@/components/theming/preview/toolbar";
import { IframeView } from "@/components/theming/preview/iframeView";
import { useContext } from "react";
import { DemoContext, EditorViewMode } from "@/components/demoContext";
import Components from "../components";

export const ThemePreview = () => {
  const { viewMode } = useContext(DemoContext);
  return (
    <div id={"previewBox"}>
      {viewMode === EditorViewMode.Component ? <Components /> : <IframeView />}
    </div>
  );
};
