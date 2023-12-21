import { DemoContext, EditorViewMode } from "@/components/demoContext";
import { FC, use, useContext, useMemo } from "react";

interface Props {
  onLoad?: () => void;
}

export const IframeView: FC<Props> = (props) => {
  const { viewMode } = useContext(DemoContext);
  const { width, height } = useMemo(() => {
    return {
      width: viewMode === EditorViewMode.Mobile ? "375px" : "100%",
      height:
        viewMode === EditorViewMode.Mobile ? "812px" : "calc(100vh - 130px)",
    };
  }, [viewMode]);
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: `calc(100vh - 120px)` }}
    >
      <iframe
        id="previewIframe"
        src="/preview"
        className={"w-full border-none shadow-xl "}
        style={{ width, height }}
        onLoad={() => {
          // console.log("iframe loaded");
          props.onLoad?.();
        }}
      />
    </div>
  );
};
