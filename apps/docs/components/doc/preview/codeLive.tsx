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
  usePrivateQuery,
  useWalletConnector,
} from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { ConnectButton } from "@/components/connectButton";
import { useConnectWallet } from "@web3-onboard/react";

const scope = {
  OrderlyConfigProvider,
  useAccount,
  useQuery,
  usePrivateQuery,
  useChains,
  useMarketsStream,
  useOrderbookStream,
  AccountStatusEnum,
  useMarketTradeStream,
};

export interface Props {
  code: string;
  noInline?: boolean;
  onCopy?: () => void;
  disabled?: boolean;
  height?: number;
  isPrivate?: boolean;
}

export const CodeLive: FC<Props> = (props) => {
  const { height = 380, isPrivate = false, noInline = true } = props;
  const { state } = useAccount();
  const [
    {
      wallet, // the wallet that has been connected or null if not yet connected
      connecting, // boolean indicating if connection is in progress
    },
    connect, // function to call to initiate user to connect wallet
  ] = useWalletConnector();

  const previewView = useMemo(() => {
    if (!isPrivate || state.status > AccountStatusEnum.NotConnected) {
      return <LivePreview />;
    }
    return (
      <div className="h-full w-full flex items-center justify-center">
        <button
          onClick={() => {
            connect();
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
    // return <LivePreview />;
  }, [state.status, isPrivate]);

  return (
    <LiveProvider
      code={props.code}
      scope={scope}
      disabled={props.disabled}
      theme={themes.github}
    >
      <div
        className="mt-3 grid grid-cols-2 rounded border border-slate-300 hover:shadow-xl"
        style={{ height: `${height}px` }}
      >
        <LiveEditor className="h-full overflow-auto text-sm bg-[#f6f8fa] code-live" />
        <div className="overflow-auto h-full p-2 code-preview">
          {/* <LivePreview /> */}
          {previewView}
        </div>
      </div>
      <div className="mt-3 bg-red-100 rounded text-red-400">
        <LiveError />
      </div>
    </LiveProvider>
  );
};
