import { FC, useMemo } from "react";
import { themes } from "prism-react-renderer";
import { LiveProvider, LiveEditor, LivePreview, LiveError } from "react-live";
import {
  OrderlyConfigProvider,
  useAccount,
  useQuery,
  useChains,
  useMarketsStream,
  useOrderbookStream,
  useMarketTradeStream,
} from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { ConnectButton } from "@/components/connectButton";

const scope = {
  OrderlyConfigProvider,
  useAccount,
  useQuery,
  useChains,
  useMarketsStream,
  useOrderbookStream,
  useMarketTradeStream,
};

export interface Props {
  code: string;
  noInline?: boolean;
  onCopy?: () => void;
  disabled?: boolean;
  height?: number;
  isPublic?: boolean;
}

export const CodeLive: FC<Props> = (props) => {
  const { height = 380, isPublic = true } = props;
  const { state } = useAccount();

  const previewView = useMemo(() => {
    console.log("code live state", state.status);
    if (isPublic || state === AccountStatusEnum.EnableTrading) {
      return <LivePreview />;
    }
    return (
      <div className="h-full w-full flex items-center justify-center">
        <ConnectButton />
      </div>
    );
    // return <LivePreview />;
  }, [state.status, isPublic]);

  return (
    <LiveProvider
      code={props.code}
      scope={scope}
      disabled={props.disabled}
      theme={themes.github}
    >
      <div
        className="mt-3 grid grid-cols-2 rounded border border-slate-300"
        style={{ height: `${height}px` }}
      >
        <div className="h-full overflow-auto text-sm bg-[#f6f8fa]">
          <LiveEditor style={{ width: "600px" }} />
        </div>
        <div className="overflow-auto h-full p-2">
          {/* <LivePreview /> */}
          {previewView}
        </div>
      </div>
      <LiveError />
    </LiveProvider>
  );
};
