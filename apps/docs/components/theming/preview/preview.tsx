import { PreviewToolbar } from "@/components/theming/preview/toolbar";
import { IframeView } from "@/components/theming/preview/iframeView";

export const ThemePreview = () => {
  return (
    <div className={"overflow-auto relative h-full"} id={"previewBox"}>
      <PreviewToolbar />
      <IframeView />
    </div>
  );
};
