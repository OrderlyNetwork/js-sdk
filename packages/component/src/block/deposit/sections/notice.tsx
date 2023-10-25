import { ChainDialog } from "@/block/pickers/chainPicker/chainDialog";
import { modal } from "@/modal";
import { OrderlyContext, useChains } from "@orderly.network/hooks";
import { ChainConfig, CurrentChain } from "@orderly.network/types";
import { FC, useContext } from "react";

interface NoticeProps {
  needCrossChain: boolean;
  needSwap: boolean;
  warningMessage?: string;
  onChainChange?: (value: any) => void;
  // onChainIdChange?: (chainId: number) => void;
  currentChain: CurrentChain | null;
}

export const Notice: FC<NoticeProps> = (props) => {
  const { needCrossChain, needSwap, warningMessage, currentChain } = props;
  const { networkId } = useContext<any>(OrderlyContext);
  const [chains, { findByChainId }] = useChains(networkId, {
    wooSwapEnabled: true,
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

  const onOpenPicker = async () => {
    const result = await modal.show<{ id: number }, any>(ChainDialog, {
      // mainChains: chains?.mainnet,
      // testChains: chains?.testnet,
      // mainChains: chains,
      testChains: chains,
      currentChainId: currentChain?.id,
    });

    const chainInfo = findByChainId(result?.id);

    props?.onChainChange?.(chainInfo);
  };

  if (warningMessage) {
    return (
      <div className="text-center text-warning text-sm">{warningMessage}</div>
    );
  }

  if (needCrossChain) {
    return (
      <div className="text-center text-warning text-sm py-2">
        <span>
          Please note that cross-chain transaction fees will be charged, or
          explore our supported
        </span>
        <a
          className="text-primary-light px-1 cursor-pointer"
          onClick={(event) => {
            event.preventDefault();
            onOpenPicker();
          }}
        >
          Bridgeless networks
        </a>
        .
      </div>
    );
  }

  if (needSwap) {
    return (
      <div className="text-center text-warning text-sm">
        Please note that swap fees will be charged.
      </div>
    );
  }

  return <div></div>;
};
