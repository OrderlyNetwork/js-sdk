import Button from "@/button";
import { StatusGuardButton } from "@/button/statusGuardButton";
import { toast } from "@/toast";
import { API, ChainConfig } from "@orderly.network/types";
import { int2hex } from "@orderly.network/utils";
import { FC, useMemo } from "react";

export interface ActionButtonProps {
  chains?: API.ChainDetail[];
  chain: any;
  onWithdraw: () => void;
  disabled: boolean;
  switchChain: (options: { chainId: string }) => Promise<any>;
  openChainPicker?: () => void;
  chainInfo?: ChainConfig;
  quantity: string;
  loading?: boolean;
  chainNotSupport: boolean;
}

export const ActionButton: FC<ActionButtonProps> = (props) => {
  const {
    chain,
    chains,
    onWithdraw,
    switchChain,
    disabled,
    openChainPicker,
    chainInfo,
    quantity,
    loading,
    chainNotSupport,
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
          <Button
            fullWidth
            onClick={onWithdraw}
            disabled={props.disabled || props.loading}
            loading={loading}
          >
            Withdraw
          </Button>
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
