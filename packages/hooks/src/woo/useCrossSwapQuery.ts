import { useCallback, useContext } from "react";
import { OrderlyContext } from "../orderlyContext";
import { useAccountInstance } from "../useAccountInstance";
import { useBoolean } from "../useBoolean";
import { woofiDexCrossChainRouterAbi } from "./constants";
import { utils } from "@orderly.network/core";

/** @hidden */
export type WooCrossSwapQueryOptions = {
  from: string;
};

/** @hidden */
export const useWooCrossSwapQuery = () => {
  const { configStore } = useContext<any>(OrderlyContext);
  const [loading, { setTrue: start, setFalse: stop }] = useBoolean(false);
  const account = useAccountInstance();

  const dstValutDeposit = useCallback(() => {
    return {
      accountId: account.accountIdHashStr,
      brokerHash: utils.parseBrokerHash(configStore.get("brokerId")!),
      tokenHash: utils.parseTokenHash("USDC"),
    };
  }, [account]);

  const queryDestinationFee = useCallback(
    async (
      crossChainRouteAddress: string,
      dst: {
        chainId: string;
        bridgedToken: string;
        toToken: string;
        minToAmount: bigint;
        orderlyNativeFees: bigint;
      }
    ) => {
      if (!account.walletClient) {
        throw new Error("walletClient is not ready");
      }
      const quotoLZFee = await account.walletClient.call(
        crossChainRouteAddress,
        "quoteLayerZeroFee",
        [account.address, dst, dstValutDeposit()],
        {
          abi: woofiDexCrossChainRouterAbi,
        }
      );

      return utils.formatByUnits(quotoLZFee[0]);
    },
    []
  );

  /// swap enquiry
  const query = useCallback(
    (inputs: {
      srcNetwork: string;
      srcToken: string;
      amount: bigint;
      slippage: number;
      dstToken: string;
      crossChainRouteAddress: string;
    }) => {
      if (loading) return Promise.resolve();
      start();

      const params = {
        // src_network: inputs.srcNetwork,
        src_network: inputs.srcNetwork,
        dst_network: "arbitrum",
        src_token: inputs.srcToken,
        dst_token: inputs.dstToken, //account.assetsManager.usdcAddress,
        src_amount: inputs.amount, //inputs.amount,
        slippage: inputs.slippage || 1,
        // to_token:account.assetsManager.usdcAddress,
      };

      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
        .join("&");

      return fetch(
        `${configStore.get(
          "swapSupportApiUrl"
        )}/woofi_dex/cross_chain_swap?${queryString}`
      )
        .then((res) => {
          if (!res.ok) {
            return res.json().then((data) => {
              throw new Error(data.error.message);
            });
          }
          return res.json();
        })
        .then((data) => {
          if (data.status === "ok") {
            return data.data;
          }
          throw new Error(data.message);
        })
        .then((swapInfo) => {
          //
          return queryDestinationFee(inputs.crossChainRouteAddress, {
            chainId: swapInfo.dst_infos.chain_id,
            bridgedToken: swapInfo.dst_infos.bridged_token,
            toToken: swapInfo.dst_infos.to_token,
            minToAmount: BigInt(swapInfo.dst_infos.min_to_amount),
            orderlyNativeFees: 0n,
          }).then((data) => {
            return {
              ...swapInfo,
              dst_infos: {
                ...swapInfo.dst_infos,
                gas_fee: data,
              },
            };
          });
        })
        .finally(() => stop());
    },

    [loading, account]
  );

  return {
    query,
    loading,
  };
};
