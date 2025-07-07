import { useCallback, useMemo } from "react";
import { useConfig, useLocalStorage } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { modal } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { CurrentChain } from "../../depositForm/hooks/useChainSelect";
import { SwapDialog } from "../components/swapDialog";
import { DST, SwapMode } from "../types";
import { useSwapEnquiry } from "./useSwapEnquiry";
import { useSwapFee } from "./useSwapFee";

type SwapDepositOptions = {
  srcToken: API.TokenInfo;
  currentChain?: CurrentChain | null;
  dst: DST;
  quantity: string;
  isNativeToken: boolean;
  depositFee: bigint;
  setQuantity: (quantity: string) => void;
  needSwap: boolean;
  needCrossSwap: boolean;
};

export const useSwapDeposit = (options: SwapDepositOptions) => {
  const {
    srcToken,
    currentChain,
    dst,
    quantity,
    isNativeToken,
    depositFee,
    setQuantity,
    needSwap,
    needCrossSwap,
  } = options;

  const [slippage, setSlippage] = useLocalStorage(
    "orderly_swap_deposit_slippage",
    1,
  );

  const config = useConfig();
  const brokerName = config.get("brokerName") || "";

  const {
    enquiry,
    transactionInfo,
    amount: swapAmount,
    querying: swapRevalidating,
    warningMessage,
    cleanTransactionInfo,
  } = useSwapEnquiry({
    quantity,
    dst,
    queryParams: {
      network: dst.network,
      srcNetwork: currentChain?.info?.network_infos?.shortName,
      srcToken: srcToken?.address,
      dstToken: dst.address,
      crossChainRouteAddress:
        currentChain?.info?.network_infos?.cross_chain_router,
      amount: new Decimal(quantity || 0)
        .mul(10 ** (srcToken?.decimals || 0))
        .toString(),
      slippage,
    },
    needSwap,
    needCrossSwap,
  });

  const cleanData = useCallback(() => {
    setQuantity("");
    cleanTransactionInfo();
  }, [setQuantity]);

  const onSwapDeposit = useCallback(async () => {
    // const _params = getSwapTestData(needCrossSwap);
    // return modal.show(SwapDialog, _params);

    return enquiry()
      .then((transaction) => {
        const amountValue = needCrossSwap
          ? transaction.route_infos?.dst.amounts[1]
          : transaction.route_infos?.amounts[1];

        const params = {
          mode: needCrossSwap ? SwapMode.Cross : SwapMode.Single,
          src: {
            chain: currentChain?.id,
            token: srcToken!.symbol,
            // swap precision
            displayDecimals: srcToken?.precision,
            amount: quantity,
            decimals: srcToken!.decimals,
          },
          dst: {
            chain: dst.chainId,
            token: dst.symbol,
            displayDecimals: 2,
            amount: new Decimal(amountValue)
              .div(Math.pow(10, dst.decimals!))
              .toString(),
            decimals: dst.decimals,
          },
          chain: currentChain?.info?.network_infos,
          nativeToken: currentChain?.info?.nativeToken,
          depositFee,
          transactionData: transaction,
          slippage,
          brokerName,
        };

        return modal.show(SwapDialog, params);
      })
      .then((isSuccss) => {
        if (isSuccss) {
          cleanData();
        }
      })
      .catch((error) => {
        // toast.error(error?.message || "Error");
      });
  }, [quantity, needCrossSwap, dst, currentChain, slippage, depositFee]);

  const swapPrice = useMemo(() => {
    if (needCrossSwap || needSwap) {
      return transactionInfo.price;
    }
    return 1;
  }, [transactionInfo]);

  const markPrice = useMemo(() => {
    if (needCrossSwap || needSwap) {
      return isNativeToken
        ? transactionInfo.markPrices.native_token
        : transactionInfo.markPrices.from_token;
    }

    return 1;
  }, [needSwap, needCrossSwap, isNativeToken, transactionInfo]);

  const swapQuantity = needSwap || needCrossSwap ? swapAmount : quantity;

  const swapFee = useSwapFee({
    nativeToken: currentChain?.info?.nativeToken,
    isNativeToken,
    src: srcToken,
    depositFee,
    transactionInfo,
    needSwap,
    needCrossSwap,
  });

  return {
    cleanTransactionInfo,
    onSwapDeposit,
    swapPrice,
    markPrice,
    swapQuantity,
    swapFee,
    swapRevalidating,
    warningMessage,
    needSwap,
    needCrossSwap,
    slippage,
    onSlippageChange: setSlippage,
  };
};
