import { useCallback, useMemo, useState } from "react";
import {
  API,
  ARBITRUM_MAINNET_CHAINID,
  ARBITRUM_TESTNET_CHAINID,
  TrackerEventName,
} from "@orderly.network/types";
import { isTestnet } from "@orderly.network/utils";
import { useAccount } from "../useAccount";
import { useConfig } from "../useConfig";
import { useTrack } from "../useTrack";
import { useChains } from "./useChains";
import { useCollateral } from "./useCollateral";
import { useMaxWithdrawal } from "./useMaxWithdrawal";

export type UseWithdrawOptions = {
  srcChainId?: number;
  token?: string;
  /** orderly token decimals */
  decimals?: number;
};

export const useWithdraw = (options: UseWithdrawOptions) => {
  const { srcChainId, token, decimals } = options;
  const { account, state } = useAccount();

  const [isLoading, setIsLoading] = useState(false);

  const { unsettledPnL, availableBalance, freeCollateral } = useCollateral();

  const networkId = useConfig("networkId");

  const [_, { findByChainId }] = useChains(undefined);

  const { track } = useTrack();

  const maxAmount = useMaxWithdrawal(token);

  const availableWithdraw = useMemo(() => {
    if (unsettledPnL < 0) {
      return freeCollateral;
    } else {
      return freeCollateral - unsettledPnL;
    }
  }, [freeCollateral, unsettledPnL]);

  const targetChain = useMemo(() => {
    let chain: API.Chain | undefined;

    // Orderly testnet supported chain
    if (networkId === "testnet") {
      chain = findByChainId(
        isTestnet(srcChainId!) ? srcChainId! : ARBITRUM_TESTNET_CHAINID,
      ) as API.Chain;
    } else {
      chain = findByChainId(srcChainId!) as API.Chain;
      // if is orderly un-supported chain
      if (!chain?.network_infos?.bridgeless) {
        // Orderly mainnet supported chain
        chain = findByChainId(ARBITRUM_MAINNET_CHAINID) as API.Chain;
      }
    }
    return chain;
  }, [networkId, findByChainId, srcChainId]);

  // Mantle chain: USDC → USDC.e
  const dst = useMemo(() => {
    const USDC = targetChain?.token_infos.find(
      (token: API.TokenInfo) => token.symbol === "USDC",
    );

    return {
      symbol: USDC?.display_name || "USDC",
      decimals: USDC?.decimals || 6,
      address: USDC?.address,
      chainId: targetChain?.network_infos?.chain_id,
      network: targetChain?.network_infos?.shortName,
    };
  }, [targetChain]);

  const withdraw = useCallback(
    (inputs: {
      chainId: number;
      token: string;
      amount: string;
      allowCrossChainWithdraw: boolean;
    }): Promise<any> => {
      return account.assetsManager
        .withdraw({ ...inputs, decimals: decimals ?? 6 })
        .then((res: any) => {
          if (res.success) {
            track(TrackerEventName.withdrawSuccess, {
              wallet: state?.connectWallet?.name,
              // TODO: fix network name, befault is not pass srcChainId
              network: targetChain?.network_infos.name,
              quantity: inputs.amount,
            });
            //   withdrawQueue.current.push(res.data.withdraw_id);
          }
          return res;
        })
        .catch((err) => {
          track(TrackerEventName.withdrawFailed, {
            wallet: state?.connectWallet?.name,
            network: targetChain?.network_infos.name,
            msg: JSON.stringify(err),
          });
          throw err;
        });
    },
    [state, targetChain, state, decimals],
  );

  return {
    dst,
    withdraw,
    isLoading,
    maxAmount,
    unsettledPnL,
    availableBalance,
    /** @deprecated use maxAmount instead */
    availableWithdraw,
  };
};
