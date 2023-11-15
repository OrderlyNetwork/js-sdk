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
import { FC } from "react";

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
}

export const CodeLive: FC<Props> = (props) => {
  const { height = 380 } = props;
  return (
    <LiveProvider code={props.code} scope={scope} disabled={props.disabled}>
      <div
        className="mt-3 grid grid-cols-2 rounded border border-slate-300"
        style={{ height: `${height}px` }}
      >
        <LiveEditor className="h-full overflow-auto" />
        <div className="overflow-auto h-full p-2">
          <LivePreview />
        </div>
      </div>
      <LiveError />
    </LiveProvider>
  );
};
