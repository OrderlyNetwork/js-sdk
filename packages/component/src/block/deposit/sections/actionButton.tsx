import Button from "@/button";
import { StatusGuardButton } from "@/button/statusGuardButton";
import { toast } from "@/toast";
import { API, ChainConfig, CurrentChain } from "@orderly.network/types";
import { int2hex } from "@orderly.network/utils";
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ApproveButton } from "./approveButton";
import { Notice } from "./notice";
import { modal } from "@/modal";
import { OrderlyContext, useChains } from "@orderly.network/hooks";
import { ChainDialog } from "@/block/pickers/chainPicker/chainDialog";

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
    // chainNotSupport,
    needSwap,
    needCrossChain,
    warningMessage,
  } = props;
  const [chainNotSupport, setChainNotSupport] = useState(false);
  const { onlyTestnet } = useContext(OrderlyContext);

  const chains = useMemo(() => {
    if (Array.isArray(props.chains)) return props.chains;

    if (onlyTestnet) {
      return props.chains.testnet ?? [];
    }
    return props.chains.mainnet;
  }, [props.chains, onlyTestnet]);

  const checkSupoort = (
    chain: CurrentChain | null,
    chains?: API.NetworkInfos[]
  ): boolean => {
    // console.log("checkSupoort", chain, chains);
    if (!chain || !chains || !Array.isArray(chains)) return false;

    const index = chains?.findIndex((c) => c.chain_id === chain.id);

    return index < 0;
  };

  useEffect(() => {
    setChainNotSupport(checkSupoort(chain, chains));
  }, [chains?.length, chain?.id]);

  // const { networkId } = useContext<any>(OrderlyContext);
  const [_, { findByChainId }] = useChains(undefined, {
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
      currentChainId: chain?.id,
    });

    const chainInfo = findByChainId(result?.id);

    props?.onChainChange?.(chainInfo);
  };

  const chainWarningMessage = useMemo(() => {
    if (!chainNotSupport) return "";
    return "Please connect to a supported network.";

    // if (chains?.length && chains.length > 1) {
    //   return `Withdrawals are not supported on ${chain?.info.network_infos?.name}. Please switch to any of the bridgeless networks.`;
    // }

    // return `Withdrawals are not supported on ${chain?.info.network_infos?.name}. Please switch to Arbitrum.`;
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
      <Button fullWidth onClick={onOpenPicker}>
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
      {chainNotSupport ? (
        <div className="text-warning text-sm text-center px-[20px] py-3">
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

      <div className="flex justify-center">
        <div className="py-3 min-w-[200px]">{actionButton}</div>
      </div>
    </>
  );
};
