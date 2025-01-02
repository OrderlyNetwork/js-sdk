import { useCallback, useMemo, useState } from "react";
import { useHoldingStream } from "./useHoldingStream";
import { useCollateral } from "./useCollateral";
import { useAccount } from "../useAccount";
import { useEventEmitter } from '../useEventEmitter'
import { useChains } from "./useChains";
import {
  API,
  ARBITRUM_MAINNET_CHAINID,
  ARBITRUM_TESTNET_CHAINID,
  EnumTrackerKeys
} from "@orderly.network/types";
import { useConfig } from "../useConfig";
import { isTestnet } from "@orderly.network/utils";

export type UseWithdrawOptions = { srcChainId?: number };

export const useWithdraw = (options?: UseWithdrawOptions) => {
  const { account, state } = useAccount();

  const [isLoading, setIsLoading] = useState(false);

  const { unsettledPnL, availableBalance, freeCollateral } = useCollateral();

  const networkId = useConfig("networkId");

  const [_, { findByChainId }] = useChains(undefined);

  const ee = useEventEmitter()

  // const withdrawQueue = useRef<number[]>([]);

  const { usdc } = useHoldingStream();

  // useEffect(() => {
  //   const unsubscribe = ws.privateSubscribe(
  //     {
  //       id: "wallet",
  //       event: "subscribe",
  //       topic: "wallet",
  //       ts: Date.now(),
  //     },
  //     {
  //       onMessage: (data: any) => {
  //         //
  //         const { id } = data;

  //         if (withdrawQueue.current.includes(id)) {
  //           withdrawQueue.current = withdrawQueue.current.filter(
  //             (item) => item !== id
  //           );
  //           ee.emit("withdraw:success", data);
  //         }
  //       },
  //     }
  //   );

  //   return () => unsubscribe();
  // }, []);

  const maxAmount = useMemo(() => {
    // if (!usdc || !usdc.holding) return 0;

    // if (unsettledPnL >= 0) return usdc?.holding ?? 0;

    // return new Decimal(usdc.holding).add(unsettledPnL).toNumber();

    return freeCollateral;
  }, [freeCollateral]);

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
        isTestnet(options?.srcChainId!)
          ? options?.srcChainId!
          : ARBITRUM_TESTNET_CHAINID
      ) as API.Chain;
    } else {
      chain = findByChainId(options?.srcChainId!) as API.Chain;
      // if is orderly un-supported chain
      if (!chain?.network_infos?.bridgeless) {
        // Orderly mainnet supported chain
        chain = findByChainId(ARBITRUM_MAINNET_CHAINID) as API.Chain;
      }
    }
    return chain;
  }, [networkId, findByChainId, options?.srcChainId]);

  // Mantle chain: USDC → USDC.e
  const dst = useMemo(() => {
    const USDC = targetChain?.token_infos.find(
      (token: API.TokenInfo) => token.symbol === "USDC"
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
      return account.assetsManager.withdraw(inputs).then((res: any) => {
        if (res.success) {
        ee.emit(EnumTrackerKeys.WITHDRAW_SUCCESS, {
          wallet:state?.connectWallet?.name,
          network:targetChain?.network_infos.name,
          quantity:inputs.amount,
        });
        //   withdrawQueue.current.push(res.data.withdraw_id);
        }
        return res;
      }).catch((err) => {
         ee.emit(EnumTrackerKeys.WITHDRAW_FAILED, {
          wallet:state?.connectWallet?.name,
          network:targetChain?.network_infos.name,
          msg: JSON.stringify(err),
        });
        throw err
      });
    },
    [state, targetChain, state]
  );


  return {
    dst,
    withdraw,
    isLoading,
    maxAmount,
    availableBalance,
    availableWithdraw,
    unsettledPnL,
  };
};
