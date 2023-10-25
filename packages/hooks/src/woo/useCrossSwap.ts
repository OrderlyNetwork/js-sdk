import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAccountInstance } from "../useAccountInstance";
import { utils } from "@orderly.network/core";
import { useBoolean } from "../useBoolean";
import { pick } from "ramda";
import { type Environment, createClient } from "@layerzerolabs/scan-client";
import { OrderlyContext } from "../orderlyContext";
import { woofiDexCrossChainRouterAbi } from "./constants";

export enum MessageStatus {
  INITIALIZING = "WAITTING",
  INFLIGHT = "INFLIGHT",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
}

export const useCrossSwap = () => {
  const [loading, { setTrue: start, setFalse: stop }] = useBoolean(false);
  const [layerStatus, setLayerStatus] = useState<MessageStatus>(
    MessageStatus.INITIALIZING
  );
  const [bridgeMessage, setBridgeMessage] = useState<any | undefined>();

  const account = useAccountInstance();
  const { networkId, configStore } = useContext(OrderlyContext);

  const client = useRef(createClient(networkId as Environment)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>();

  const checkLayerStatus = useCallback((txHash: string) => {
    const check = async (txHash: string) => {
      const { messages } = await client.getMessagesBySrcTxHash(txHash);
      console.log("messages:", messages);

      if (messages.length > 0) {
        const { status } = messages[0];

        if (status === MessageStatus.INFLIGHT) {
          setTimeout(() => {
            check(txHash);
          }, 1000);
        }
        setLayerStatus(status as MessageStatus);

        if (status === MessageStatus.DELIVERED) {
          setBridgeMessage(messages[0]);
        }
      } else {
        setTimeout(() => {
          check(txHash);
        }, 1000);
      }
    };

    check(txHash);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const dstValutDeposit = useCallback(() => {
    return {
      accountId: account.accountIdHashStr,
      brokerHash: utils.parseBrokerHash(configStore.get("brokerId")!),
      tokenHash: utils.parseTokenHash("USDC"),
    };
  }, [account]);

  const swap = async (inputs: {
    address: string;
    crossChainRouteAddress: string;
    src: {
      fromToken: string;
      fromAmount: bigint;
      bridgeToken: string;
      minBridgeAmount: bigint;
    };
    dst: {
      chainId: string;
      bridgedToken: string;
      toToken: string;
      minToAmount: bigint;
      airdropNativeAmount: bigint;
    };
  }) => {
    if (!account.walletClient) {
      throw new Error("walletClient is undefined");
    }

    if (!account.address) {
      throw new Error("account.address is undefined");
    }

    if (!inputs.crossChainRouteAddress) {
      throw new Error("crossChainRouteAddress is undefined");
    }

    const { address, src, dst, crossChainRouteAddress } = inputs;
    if (loading) return;
    start();

    const quotoLZFee = await account.walletClient.call(
      crossChainRouteAddress,
      "quoteLayerZeroFee",
      [account.address, dst, dstValutDeposit()],
      {
        abi: woofiDexCrossChainRouterAbi,
      }
    );

    // const result = await account.walletClient.call(
    //   crossChainRouteAddress,
    //   "crossSwap",
    //   [
    //     account.address,
    //     src,
    //     dst,
    //     dstValutDeposit(),
    //     {
    //       value: quotoLZFee[0],
    //     },
    //   ],
    //   {
    //     abi: woofiDexCrossChainRouterAbi,
    //   }
    // );

    try {
      const result = await account.walletClient.sendTransaction(
        crossChainRouteAddress,
        "crossSwap",
        {
          from: account.address!,
          to: crossChainRouteAddress,
          data: [account.address, src, dst, dstValutDeposit()],
          value: quotoLZFee[0],
        },
        {
          abi: woofiDexCrossChainRouterAbi,
        }
      );

      account.walletClient.on(
        {
          address: crossChainRouteAddress,
        },
        (log: any, event: any) => {
          console.log("-------------", log, event);
        }
      );

      stop();

      // console.log("swap result:", result);

      checkLayerStatus(result.hash);

      return pick(["from", "to", "hash", "value"], result);
    } catch (e: any) {
      console.log("swap error:", e);
      stop();
      throw new Error(e.errorCode);
    }
  };

  return {
    swap,
    loading,
    status: layerStatus,
    message: bridgeMessage,
  };
};
