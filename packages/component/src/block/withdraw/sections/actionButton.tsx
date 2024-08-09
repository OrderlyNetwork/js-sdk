import { FC, useEffect, useMemo, useState, useRef, useCallback } from "react";
import Button from "@/button";
import { toast } from "@/toast";
import { API, CurrentChain } from "@orderly.network/types";
import { int2hex } from "@orderly.network/utils";
import { usePrivateQuery, useWalletSubscription } from "@orderly.network/hooks";
import { modal } from "@orderly.network/ui";
import { CrossChainConfirm } from "./crossChainConfirm";
import { useChainNotSupport } from "../useChainNotSupport";
import { StatusGuardButton } from "@/block/accountStatus";

export interface ActionButtonProps {
  chains?: API.NetworkInfos[];
  chain: CurrentChain | null;
  onWithdraw: () => void;
  disabled: boolean;
  switchChain: (options: { chainId: string }) => Promise<any>;
  openChainPicker?: () => Promise<{ id?: number; name?: string }>;
  quantity: string;
  address: string | undefined;
  loading?: boolean;
  chainVaultBalance: number;
  maxAmount: number;
  fee: number;
  crossChainWithdraw: boolean;
}

export const ActionButton: FC<ActionButtonProps> = (props) => {
  const {
    chain,
    chains,
    onWithdraw,
    switchChain,
    disabled,
    openChainPicker,
    quantity,
    loading,
    chainVaultBalance,
    maxAmount,
    crossChainWithdraw,
    address,
    fee,
  } = props;

  /// has cross chain withdraw transaction
  const [crossChainTrans, setCrossChainTrans] = useState<any | undefined>(
    undefined
  );

  const chainNotSupport = useChainNotSupport(chain!, chains!);

  const { data: assetHistory } = usePrivateQuery<any[]>("/v1/asset/history", {
    revalidateOnMount: true,
  });

  const needCrossChain = useRef<Boolean>(false);

  useWalletSubscription({
    onMessage(data: any) {
      if (!crossChainTrans) return;
      console.log("subscribe wallet topic", data);
      const { trxId, transStatus } = data;
      if (trxId === crossChainTrans && transStatus === "COMPLETED") {
        setCrossChainTrans(undefined);
      }
    },
  });

  useEffect(() => {
    // const item = assetHistory?.find((e: any) => e.trans_status === "COMPLETED");
    const item = assetHistory?.find(
      (e: any) => e.trans_status === "pending_rebalance".toUpperCase()
    );
    setCrossChainTrans(item);
  }, [assetHistory]);

  const warningMessage = useMemo(() => {
    const networkName = chain?.info?.network_infos?.name;
    // check has cross chain withdraw
    if (crossChainTrans) {
      return `Your cross-chain withdrawal is being processed...`;
    }
    // check cur chain is support no not
    if (chainNotSupport) {
      if (chains?.length && chains.length > 1) {
        return `Withdrawals are not supported on ${
          networkName ?? "this chain"
        }. Please switch to any of the bridgeless networks.`;
      }

      return `Withdrawals are not supported on ${networkName ?? "this chain"}.`;
    }
    // check quantity and vaultBalance
    if (crossChainWithdraw) {
      needCrossChain.current = true;
      return `Withdrawal exceeds the balance of the ${networkName} vault ( ${chainVaultBalance} USDC ). Cross-chain rebalancing fee will be charged for withdrawal to ${networkName}.`;
    }

    return undefined;
  }, [
    chainNotSupport,
    chains,
    chain,
    quantity,
    maxAmount,
    crossChainWithdraw,
    chainVaultBalance,
  ]);

  const onClick = useCallback(() => {
    const qty = parseFloat(quantity);
    if (crossChainWithdraw) {
      modal.confirm({
        title: "Confirm to withdraw",
        content: (
          <CrossChainConfirm
            address={address || ""}
            amount={qty - fee}
            chain={chain}
          />
        ),
        onOk: async () => {
          onWithdraw();
        },
        onCancel: async () => {},
      });
    } else {
      onWithdraw();
    }
  }, [crossChainWithdraw, quantity, fee]);

  const swtichChain = (chainId: number) => {
    toast.promise(switchChain({ chainId: int2hex(chainId) }), {
      loading: "Loading",
      success: (data) => `Successfully`,
      error: (err) => `Error: ${err.toString()}`,
    });
  };

  const actionButton = useMemo(() => {
    if (!chainNotSupport) {
      return (
        <StatusGuardButton>
          <Button
            id="orderly-withdraw-confirm-button"
            className="desktop:orderly-text-xs"
            fullWidth
            onClick={onClick}
            disabled={
              props.disabled || props.loading || crossChainTrans !== undefined
            }
            loading={loading}
          >
            Withdraw
          </Button>
        </StatusGuardButton>
      );
    }

    return (
      <Button
        id="orderly-withdraw-confirm-button"
        className="desktop:orderly-text-xs"
        fullWidth
        onClick={() => {
          openChainPicker?.().then(({ id }) => {
            id && swtichChain(id);
          });
        }}
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
  ]);

  return (
    <>
      <div className="orderly-withdraw-warning-message">
        {warningMessage && (
          <div className="orderly-warning-msg orderly-text-warning orderly-text-4xs orderly-text-center orderly-px-[20px] orderly-pt-4 orderly-pb-3 desktop:orderly-text-2xs">
            {warningMessage}
          </div>
        )}{" "}
      </div>

      <div className="orderly-flex orderly-justify-center orderly-text-xs desktop:orderly-text-xs orderly-font-bold">
        <div className="orderly-withdraw-action-button-container orderly-w-full">
          {actionButton}
        </div>
      </div>
    </>
  );
};
