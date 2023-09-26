import Button from "@/button";
import { StatusGuardButton } from "@/button/statusGuardButton";
import { toast } from "@/toast";
import { API, ChainConfig, ChainInfo } from "@orderly.network/types";
import { int2hex } from "@orderly.network/utils";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { ApproveButton } from "./approveButton";

export interface ActionButtonProps {
  chains?: API.ChainDetail[];
  chain: any;
  onDeposit: () => Promise<any>;
  disabled: boolean;
  switchChain: (options: { chainId: string }) => Promise<any>;
  openChainPicker?: () => void;
  chainInfo?: ChainConfig;
  quantity: string;
  loading?: boolean;
  allowance: string;
  submitting: boolean;
  onApprove?: () => Promise<any>;
}

export const ActionButton: FC<ActionButtonProps> = (props) => {
  const {
    chain,
    chains,
    onDeposit,
    switchChain,
    disabled,
    openChainPicker,
    chainInfo,
    quantity,
    loading,
    allowance,
    onApprove,
    submitting,
  } = props;

  const checkSupoort = (
    chain: any | null,
    chains: API.ChainDetail[] | undefined
  ): boolean => {
    if (!chain || !chains) return false;

    const index = chains?.findIndex(
      (c) => parseInt(c.chain_id) === parseInt(chain!.id)
    );

    return index < 0;
  };

  const [chainNotSupport, setChainNotSupport] = useState(() =>
    checkSupoort(chain, chains)
  );

  const [approveLoading, setApproveLoading] = useState(false);

  useEffect(() => {
    // console.log({ chain, chains });
    setChainNotSupport(checkSupoort(chain, chains));
  }, [chain, chains]);

  const chainWarningMessage = useMemo(() => {
    if (!chainNotSupport) return "";

    if (chains?.length && chains.length > 1) {
      return `Withdrawals are not supported on ${chainInfo?.chainName}. Please switch to any of the bridgeless networks.`;
    }

    return `Withdrawals are not supported on ${chainInfo?.chainName}. Please switch to Arbitrum.`;
  }, [chainNotSupport, chains, chainInfo]);

  const actionButton = useMemo(() => {
    if (!chainNotSupport) {
      return (
        <StatusGuardButton>
          <ApproveButton
            onApprove={props.onApprove}
            onDeposit={onDeposit}
            allowance={allowance}
            quantity={quantity}
            submitting={submitting}
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
    approveLoading,
    submitting,
  ]);

  return (
    <>
      {chainNotSupport && (
        <div className="text-warning text-sm text-center px-[20px] py-3">
          {chainWarningMessage}
        </div>
      )}

      <div className="flex justify-center">
        <div className="py-3 w-2/3">{actionButton}</div>
      </div>
    </>
  );
};
