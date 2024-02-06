import Button from "@/button";
import { StatusGuardButton } from "@/button/statusGuardButton";
import { API, CurrentChain } from "@orderly.network/types";
import { isTestnet } from "@orderly.network/utils";
import { FC, useContext, useMemo } from "react";
import { ApproveButton } from "./approveButton";
import { Notice } from "./notice";
import { modal } from "@/modal";
import { useChains } from "@orderly.network/hooks";
import { ChainDialog } from "@/block/pickers/chainPicker/chainDialog";
import { OrderlyAppContext } from "@/provider";

export interface ActionButtonProps {
  chains:
    | API.NetworkInfos[]
    | { mainnet: API.NetworkInfos[]; testnet: API.NetworkInfos[] };
  chain: CurrentChain | null;
  token?: API.TokenInfo;
  onDeposit: () => Promise<any>;
  disabled: boolean;
  switchChain: (options: { chainId: string }) => Promise<any>;
  openChainPicker?: () => void;
  quantity: string;
  loading?: boolean;
  allowance: number;
  submitting: boolean;
  maxQuantity: string;
  chainNotSupport: boolean;
  needSwap: boolean;
  needCrossChain: boolean;
  warningMessage?: string;
  onApprove?: () => Promise<any>;
  onChainChange?: (value: any) => void;
}

export const ActionButton: FC<ActionButtonProps> = (props) => {
  const {
    chain,
    token,
    // chains,
    onDeposit,
    switchChain,
    disabled,
    // openChainPicker,
    quantity,
    loading,
    allowance,
    onApprove,
    submitting,
    maxQuantity,
    needSwap,
    needCrossChain,
    warningMessage,
    chainNotSupport,
  } = props;
  const { enableSwapDeposit } = useContext(OrderlyAppContext);

  const chains = useMemo(() => {
    if (Array.isArray(props.chains)) return props.chains;

    if (!props.chain?.id) {
      return props.chains?.mainnet ?? [];
    }

    if (isTestnet(props.chain?.id!)) {
      return (
        (chainNotSupport ? props.chains?.mainnet : props.chains?.testnet) ?? []
      );
    }

    return (
      (chainNotSupport ? props.chains?.testnet : props.chains?.mainnet) ?? []
    );
  }, [props.chains, props.chain, chainNotSupport]);

  const [_, { findByChainId }] = useChains(undefined, {
    wooSwapEnabled: enableSwapDeposit,
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

  const onOpenPicker = async () => {
    const result = await modal.show<{ id: number }, any>(ChainDialog, {
      testChains: chains,
      currentChainId: chain?.id,
    });

    if (result?.id) {
      const chainInfo = findByChainId(result.id);
      props?.onChainChange?.(chainInfo);
    }
  };

  const chainWarningMessage = useMemo(() => {
    if (!chainNotSupport) return "";
    return "Please connect to a supported network.";
  }, [chainNotSupport, chains, chain?.info?.network_infos?.name]);

  const actionButton = useMemo(() => {
    if (!chainNotSupport) {
      let label = "Deposit";
      // if (needCrossChain) {
      //   label = "Swap and deposit";
      // } else if (needSwap) {
      //   label = "Bridge and deposit";
      // }
      if (needSwap || needCrossChain) {
        label = "Swap and deposit";
      }
      return (
        <StatusGuardButton>
          <ApproveButton
            onApprove={props.onApprove}
            onDeposit={onDeposit}
            allowance={allowance}
            quantity={quantity}
            submitting={submitting}
            maxQuantity={maxQuantity}
            token={token?.symbol}
            label={label}
            disabled={disabled}
            buttonId="orderly-deposit-confirm-button"
          />
        </StatusGuardButton>
      );
    }

    return (
      <Button
        fullWidth
        onClick={onOpenPicker}
        id="orderly-deposit-confirm-button"
        className="desktop:orderly-text-xs"
      >
        Switch network
      </Button>
    );
  }, [
    chainNotSupport,
    chains,
    switchChain,
    disabled,
    chain,
    quantity,
    loading,
    allowance,
    onApprove,
    onDeposit,
    submitting,
    maxQuantity,
    needSwap,
    needCrossChain,
  ]);

  return (
    <>
      <div className="orderly-deposit-warning-message">
        {chainNotSupport ? (
          <div className="orderly-text-warning orderly-text-4xs orderly-text-center orderly-px-[20px] orderly-pt-4 orderly-pb-3 desktop:orderly-text-2xs ">
            {chainWarningMessage}
          </div>
        ) : (
          <Notice
            needCrossChain={needCrossChain}
            needSwap={needSwap}
            warningMessage={warningMessage}
            onOpenPicker={onOpenPicker}
            currentChain={chain}
            notSupportChain={chainNotSupport}
          />
        )}
      </div>

      <div className="orderly-flex orderly-justify-center">
        <div className="orderly-deposit-action-button-container orderly-w-full orderly-text-xs orderly-font-bold">
          {actionButton}
        </div>
      </div>
    </>
  );
};
