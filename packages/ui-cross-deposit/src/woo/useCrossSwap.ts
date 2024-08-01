import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Environment, createClient } from "@layerzerolabs/scan-client";
import { utils } from "@orderly.network/core";
import {
  OrderlyContext,
  useAccountInstance,
  useBoolean,
  useConfig,
  useEventEmitter,
} from "@orderly.network/hooks";
import { WS_WalletStatusEnum } from "@orderly.network/types";
import { pick } from "ramda";
import { isNativeTokenChecker, woofiDexCrossChainRouterAbi } from "./constants";

export enum MessageStatus {
  INITIALIZING = "WAITTING",
  INFLIGHT = "INFLIGHT",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
}

export const useCrossSwap = (): any => {
  const [loading, { setTrue: start, setFalse: stop }] = useBoolean(false);

  const [layerStatus, setLayerStatus] = useState<MessageStatus>(
    MessageStatus.INITIALIZING
  );

  const ee = useEventEmitter();

  const [bridgeMessage, setBridgeMessage] = useState<any | undefined>();

  const [status, setStatus] = useState<WS_WalletStatusEnum>(
    WS_WalletStatusEnum.NO
  );
  const txHashFromBridge = useRef<string | undefined>();

  const account = useAccountInstance();
  const { configStore } = useContext(OrderlyContext);
  const networkId = useConfig("networkId");

  const client = useRef(createClient(networkId as Environment)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>();

  //TODO: useWalletSubscription
  // useWalletSubscription({
  //   onMessage: (message) => {
  //     const { side, transStatus, trxId } = message;

  //     if (side === "DEPOSIT" && trxId === txHashFromBridge.current) {
  //       setStatus(transStatus);
  //     }
  //   },
  // });

  useEffect(() => {
    const handler = (data: any) => {
      const { side, transStatus, trxId } = data;

      if (side === "DEPOSIT" && trxId === txHashFromBridge.current) {
        setStatus(transStatus);
      }
    };
    ee.on("wallet:changed", handler);

    return () => {
      ee.off("wallet:changed", handler);
    };
  }, [txHashFromBridge.current]);

  const checkLayerStatus = useCallback((txHash: string) => {
    const check = async (txHash: string) => {
      try {
        const { messages } = await client.getMessagesBySrcTxHash(txHash);

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
            txHashFromBridge.current = messages[0].dstTxHash;
          }

          if (status === MessageStatus.FAILED) {
            setBridgeMessage(messages[0]);
          }
        } else {
          setTimeout(() => {
            check(txHash);
          }, 1000);
        }
      } catch (e) {
        // setLayerStatus(MessageStatus.FAILED);
        setTimeout(() => {
          check(txHash);
        }, 1000);
      }
    };

    check(txHash);
  }, []);

  //swap 的時候拿 src tx hash, cross swap 拿 dst tx hash
  // const checkDeposit

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
          value: isNativeTokenChecker(inputs.src.fromToken)
            ? BigInt(inputs.src.fromAmount) + quotoLZFee[0]
            : quotoLZFee[0],
        },
        {
          abi: woofiDexCrossChainRouterAbi,
        }
      );

      // account.walletClient.on(
      //   {
      //     address: crossChainRouteAddress,
      //   },
      //   (log: any, event: any) => {
      //
      //   }
      // );

      stop();

      //

      checkLayerStatus(result.hash);

      // @ts-ignore
      return pick(["from", "to", "hash", "value"], result);
    } catch (e: any) {
      stop();
      throw new Error(e.errorCode);
    }
  };

  return {
    swap,
    loading,
    bridgeStatus: layerStatus,
    status,
    message: bridgeMessage,
  };
};
