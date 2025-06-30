import { useCallback, useMemo, useState } from "react";
import { account as accountPerp } from "@orderly.network/perp";
import {
  API,
  ARBITRUM_MAINNET_CHAINID,
  ARBITRUM_TESTNET_CHAINID,
  TrackerEventName,
} from "@orderly.network/types";
import { isTestnet } from "@orderly.network/utils";
import { useIndexPricesStream, usePositionStream } from "..";
import { useAccount } from "../useAccount";
import { useConfig } from "../useConfig";
import { useEventEmitter } from "../useEventEmitter";
import { useTrack } from "../useTrack";
import { useChains } from "./useChains";
import { useCollateral } from "./useCollateral";
import { useHoldingStream } from "./useHoldingStream";

export type UseWithdrawOptions = {
  srcChainId?: number;
  decimals?: number;
  symbol?: string;
};

export const useWithdraw = (options?: UseWithdrawOptions) => {
  const { account, state } = useAccount();

  const [isLoading, setIsLoading] = useState(false);

  const { unsettledPnL, availableBalance, freeCollateral } = useCollateral();

  const networkId = useConfig("networkId");

  const [_, { findByChainId }] = useChains(undefined);

  const ee = useEventEmitter();

  const { track } = useTrack();

  // const withdrawQueue = useRef<number[]>([]);

  const { usdc } = useHoldingStream();

  const { data: indexPrices } = useIndexPricesStream();

  const [data] = usePositionStream(options?.symbol);

  const unrealPnL = data?.aggregated?.total_unreal_pnl ?? 0;

  const usdcBalance = usdc?.holding ?? 0;

  const indexPrice = useMemo(() => {
    if (options?.symbol === "USDC") {
      return 1;
    }
    const symbol = `PERP_${options?.symbol}_USDC`;
    return indexPrices[symbol] ?? 0;
  }, [options?.symbol, indexPrices]);

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
    const parameters = {
      USDCBalance: usdcBalance,
      freeCollateral: freeCollateral,
      upnl: unrealPnL,
    };
    return accountPerp.maxWithdrawalUSDC(parameters);
  }, [usdcBalance, freeCollateral, unrealPnL]);

  const getCollateralRatio = useCallback(
    (token: API.TokenInfo, collateralQty: number) => {
      return accountPerp.collateralRatio({
        baseWeight: token?.base_weight ?? 0,
        discountFactor: token?.discount_factor ?? 0,
        collateralQty: collateralQty,
        indexPrice: indexPrice,
      });
    },
    [indexPrice],
  );

  const maxOthersAmount = useCallback(
    (token: API.TokenInfo, qty: number) => {
      return accountPerp.maxWithdrawalOtherCollateral({
        collateralQty: qty,
        freeCollateral: freeCollateral,
        indexPrice: indexPrice,
        weight: getCollateralRatio(token, qty),
      });
    },
    [freeCollateral, indexPrice, getCollateralRatio],
  );

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
          : ARBITRUM_TESTNET_CHAINID,
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
      return (
        account.assetsManager
          // TODO: use orderly token decimals variable from api instead of hardcode 6
          .withdraw({ ...inputs, decimals: 6 })
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
          })
      );
    },
    [state, targetChain, state, options?.decimals],
  );

  return {
    dst,
    withdraw,
    isLoading,
    maxAmount: maxAmount,
    maxOthersAmount: maxOthersAmount,
    availableBalance,
    availableWithdraw,
    unsettledPnL,
  };
};
