import { FC, use, useContext, useMemo, useRef, useState } from "react";
import { DemoContext, EditorViewMode } from "@/components/demoContext";
import { Spinner } from "@orderly.network/react";
import { useThemeUpdate } from "../useThemeUpdate";

interface Props {
  onLoad?: () => void;
}

export const IframeView: FC<Props> = (props) => {
  const { viewMode } = useContext(DemoContext);
  const [loading, setLoading] = useState(true);
  // const iframeRef = useRef<HTMLIFrameElement>(null);

  const [iframeRef, setIframeRef] = useState<HTMLElement>();

  const { width, height } = useMemo(() => {
    return {
      width: viewMode === EditorViewMode.Mobile ? "375px" : "100%",
      height:
        viewMode === EditorViewMode.Mobile ? "812px" : "calc(100vh - 130px)",
    };
  }, [viewMode]);

  useThemeUpdate(iframeRef as HTMLElement);

  return (
    <div
      className="flex items-center justify-center relative"
      style={{ minHeight: `calc(100vh - 120px)` }}
    >
      <iframe
        ref={(ref) => setIframeRef(ref?.contentDocument?.body as HTMLElement)}
        id="theme-root-el"
        src="/preview"
        className={"w-full border-none shadow-xl "}
        style={{ width, height }}
        onLoad={() => {
          setLoading(false);
        }}
        onError={(err) => {
          console.log("iframe error", err);
        }}
      />
      {loading ? (
        <div className="absolute left-0 top-0 right-0 bottom-0 flex items-center justify-center">
          <Spinner />
        </div>
      ) : null}
    </div>
  );
};
