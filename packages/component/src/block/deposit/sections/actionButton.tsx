import Button from "@/button";
import { StatusGuardButton } from "@/button/statusGuardButton";
import { toast } from "@/toast";
import { API, ChainConfig, CurrentChain } from "@orderly.network/types";
import { int2hex } from "@orderly.network/utils";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { ApproveButton } from "./approveButton";

export interface ActionButtonProps {
  chains?: API.ChainDetail[];
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
  onApprove?: () => Promise<any>;
}

export const ActionButton: FC<ActionButtonProps> = (props) => {
  const {
    chain,
    token,
    chains,
    onDeposit,
    switchChain,
    disabled,
    openChainPicker,
    quantity,
    loading,
    allowance,
    onApprove,
    submitting,
    maxQuantity,
    chainNotSupport,
    needSwap,
    needCrossChain,
  } = props;

  const chainWarningMessage = useMemo(() => {
    if (!chainNotSupport) return "";

    if (chains?.length && chains.length > 1) {
      return `Withdrawals are not supported on ${chain?.info.network_infos?.name}. Please switch to any of the bridgeless networks.`;
    }

    return `Withdrawals are not supported on ${chain?.info.network_infos?.name}. Please switch to Arbitrum.`;
  }, [chainNotSupport, chains, chain?.info.network_infos?.name]);

  const actionButton = useMemo(() => {
    if (!chainNotSupport) {
      let label = "Deposit";
      if (needCrossChain) {
        label = "Swap and deposit";
      } else if (needSwap) {
        label = "Bridge and deposit";
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
          />
        </StatusGuardButton>
      );
    }

    if (chains?.length === 1) {
      return (
        <Button
          fullWidth
          onClick={() => {
            const chain = chains[0];
            if (chain) {
              toast.promise(
                switchChain({ chainId: int2hex(Number(chain.chain_id)) }),
                {
                  loading: "Loading",
                  success: (data) => `Successfully`,
                  error: (err) => `Error: ${err.toString()}`,
                }
              );
            }
          }}
        >
          Switch to Arbitrum
        </Button>
      );
    }
    return (
      <Button fullWidth onClick={openChainPicker}>
        Switch Network
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
      {chainNotSupport && (
        <div className="text-warning text-sm text-center px-[20px] py-3">
          {chainWarningMessage}
        </div>
      )}

      <div className="flex justify-center">
        <div className="py-3 min-w-[200px]">{actionButton}</div>
      </div>
    </>
  );
};
