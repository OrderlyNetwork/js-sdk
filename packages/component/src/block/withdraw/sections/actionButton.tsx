import Button from "@/button";
import { StatusGuardButton } from "@/button/statusGuardButton";
import { toast } from "@/toast";
import { parseNumber } from "@/utils/num";
import { API, Chain, ChainConfig, CurrentChain } from "@orderly.network/types";
import { int2hex } from "@orderly.network/utils";
import { FC, useEffect, useMemo, useState, useRef, useCallback } from "react";
import { usePrivateQuery, useWalletSubscription } from "@orderly.network/hooks";
import { modal } from "@/modal";
import { CrossChainConfirm } from "./crossChainConfirm";

export interface ActionButtonProps {
  chains?: API.NetworkInfos[];
  chain: CurrentChain | null;
  onWithdraw: () => void;
  disabled: boolean;
  switchChain: (options: { chainId: string }) => Promise<any>;
  openChainPicker?: () => Promise<{ id: number; name: string }>;
  // chainInfo?: ChainConfig;
  quantity: string;
  address: string | undefined;
  loading?: boolean;
  chainVaultBalance: number;
  maxAmount: number;
  fee: number;
  crossChainWithdraw: boolean;
  // chainNotSupport: boolean;
}

export const ActionButton: FC<ActionButtonProps> = (props) => {
  const {
    chain,
    chains,
    onWithdraw,
    switchChain,
    disabled,
    openChainPicker,
    // chainInfo,
    quantity,
    loading,
    // chainNotSupport,
    chainVaultBalance,
    maxAmount,
    crossChainWithdraw,
    address,
    fee,
  } = props;

  const [chainNotSupport, setChainNotSupport] = useState(false);
  /// has cross chain withdraw transaction
  const [crossChainTrans, setCrossChainTrans] = useState<any | undefined>(undefined);

  const { data: assetHistory } = usePrivateQuery<any[]>('/v1/asset/history', {
    revalidateOnMount: true,
  });

  const needCrossChain = useRef<Boolean>(false);


  const checkSupoort = (
    chain: CurrentChain | null,
    chains: API.NetworkInfos[] | undefined
  ): boolean => {
    if (!chain || !chains) return false;

    const index = chains?.findIndex((c) => c.chain_id === chain.id);

    return index < 0;
  };

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
    const item = assetHistory?.find((e: any) => e.trans_status === "pending_rebalance".toUpperCase());
    setCrossChainTrans(item);
  }, [assetHistory]);

  // console.log("input quantity", quantity, assetHistory);


  const warningMessage = useMemo(() => {
    // check has cross chain withdraw
    if (crossChainTrans) {
      return `Your cross-chain withdrawal of ${crossChainTrans.amount} USDC is currently in progress...`;
    }
    // check cur chain is support no not
    if (chainNotSupport) {
      if (chains?.length && chains.length > 1) {
        return `Withdrawals are not supported on ${chain?.info?.network_infos?.name}. Please switch to any of the bridgeless networks.`;
      }

      return `Withdrawals are not supported on ${chain?.info?.network_infos?.name}. Please switch to Arbitrum.`;
    }
    // check quantity and vaultBalance
    if (crossChainWithdraw) {
      needCrossChain.current = true;
      return `Currently, there is only ${chainVaultBalance} USDC in the Arbitrum Vault. Your withdrawal request exceeds this amount, necessitating a cross-chain rebalance and it will incur additional cross-chain gas fees.`
    }

    return undefined;

  }, [chainNotSupport, chains, chain, quantity, maxAmount, crossChainWithdraw, chainVaultBalance]);

  useEffect(() => {
    setChainNotSupport(checkSupoort(chain, chains));
  }, [chains?.length, chain?.id]);


  const onClick = useCallback(() => {
    const qty = parseFloat(quantity);
    if (crossChainWithdraw) {
      modal.confirm({
        title: "Confirm to withdraw",
        content: (
          <CrossChainConfirm address={address || ""} amount={qty-fee} chain={chain}/>
        ),
        onOk: async () => {
          onWithdraw();
        },
        onCancel: async () => {

        }
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
            disabled={props.disabled || props.loading || crossChainTrans !== undefined}
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
          id="orderly-withdraw-confirm-button"
          className="desktop:orderly-text-xs"
          fullWidth
          onClick={() => {
            const chain = chains[0];
            //
            if (chain) {
              swtichChain(chain.chain_id);
              // toast.promise(
              //   switchChain({ chainId: int2hex(chain.chain_id) }),
              //   {
              //     loading: "Loading",
              //     success: (data) => `Successfully`,
              //     error: (err) => `Error: ${err.toString()}`,
              //   }
              // );
            }
          }}
        >
          Switch to Arbitrum
        </Button>
      );
    }
    return (
      <Button
        id="orderly-withdraw-confirm-button"
        className="desktop:orderly-text-xs"
        fullWidth
        onClick={() =>
          openChainPicker?.().then(({ id }) => {
            swtichChain(id);
          })
        }
      >
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
      {warningMessage && (
        <div className="orderly-text-warning orderly-text-3xs orderly-text-center orderly-px-[20px] orderly-py-3 desktop:orderly-text-2xs">
          {warningMessage}
        </div>
      )}

      <div className="orderly-flex orderly-justify-center orderly-text-xs desktop:orderly-text-xs orderly-font-bold">
        <div className="orderly-withdraw-action-button-container orderly-py-3 orderly-w-full">
          {actionButton}
        </div>
      </div>
    </>
  );
};
