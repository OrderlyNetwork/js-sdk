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
    src: {
      fromToken: string;
      fromAmount: string;
      bridgeToken: string;
      minBridgeAmount: string;
    };
    dst: {
      chainId: string;
      bridgedToken: string;
      toToken: string;
      minToAmount: string;
      airdropNativeAmount: string;
    };
  }) => {
    if (!account.walletClient) {
      throw new Error("walletClient is undefined");
    }
    const { address, src, dst } = inputs;
    if (loading) return;
    start();
    const quotoLZFee = await account.walletClient.call(
      "0xC7498b7e7C9845b4B2556f2a4B7Cad2B7F2C0dC4",
      "quoteLayerZeroFee",
      [account.address, dst, dstValutDeposit()],
      {
        abi: woofiDexCrossChainRouterAbi,
      }
    );

    const result = await account.walletClient.call(
      "0xC7498b7e7C9845b4B2556f2a4B7Cad2B7F2C0dC4",
      "crossSwap",
      [
        account.address,
        src,
        dst,
        dstValutDeposit(),
        {
          value: quotoLZFee[0],
        },
      ],
      {
        abi: woofiDexCrossChainRouterAbi,
      }
    );

    account.walletClient.on(
      {
        address: "0xC7498b7e7C9845b4B2556f2a4B7Cad2B7F2C0dC4",
      },
      (log: any, event: any) => {
        console.log("-------------", log, event);
      }
    );

    stop();

    // console.log("swap result:", result);

    checkLayerStatus(result.hash);

    return pick(["from", "to", "hash", "value"], result);
  };

  return {
    swap,
    loading,
    status: layerStatus,
    message: bridgeMessage,
  };
};
