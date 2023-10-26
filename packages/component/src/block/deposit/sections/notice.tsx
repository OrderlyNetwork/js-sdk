import { ChainDialog } from "@/block/pickers/chainPicker/chainDialog";
import { modal } from "@/modal";
// import { OrderlyContext, useChains } from "@orderly.network/hooks";
import { ChainConfig, CurrentChain } from "@orderly.network/types";
import { FC, useContext } from "react";

interface NoticeProps {
  needCrossChain: boolean;
  needSwap: boolean;
  warningMessage?: string;
  notSupportChain?: boolean;
  // onChainChange?: (value: any) => void;
  // onChainIdChange?: (chainId: number) => void;
  currentChain: CurrentChain | null;
  onOpenPicker: () => Promise<any>;
}

export const Notice: FC<NoticeProps> = (props) => {
  const { needCrossChain, needSwap, warningMessage, currentChain } = props;

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
            props.onOpenPicker();
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
