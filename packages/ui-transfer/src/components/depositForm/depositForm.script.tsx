import { useCallback, useEffect, useMemo } from "react";
import {
  useAccount,
  useConfig,
  useDeposit,
  useHoldingStream,
  useIndexPrice,
  useIndexPricesStream,
  usePositionStream,
  useQuery,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { account } from "@orderly.network/perp";
import { useAppContext, useDataTap } from "@orderly.network/react-app";
import { API, NetworkId, ChainNamespace } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { feeDecimalsOffset } from "../../utils";
import { useNeedSwapAndCross } from "../swap/hooks/useNeedSwapAndCross";
import { useSwapDeposit } from "../swap/hooks/useSwapDeposit";
import {
  useActionType,
  useChainSelect,
  useDepositAction,
  useInputStatus,
} from "./hooks";
import { useToken } from "./hooks/useToken";

const { collateralRatio, LTV, collateralContribution, calcMinimumReceived } =
  account;

export type UseDepositFormScriptReturn = ReturnType<
  typeof useDepositFormScript
>;

export type UseDepositFormScriptOptions = {
  onClose?: () => void;
};

export const useDepositFormScript = (options: UseDepositFormScriptOptions) => {
  const { wrongNetwork } = useAppContext();
  const { t } = useTranslation();

  const networkId = useConfig("networkId") as NetworkId;

  const { chains, currentChain, settingChain, onChainChange } =
    useChainSelect();

  const {
    sourceToken,
    targetToken,
    sourceTokens,
    targetTokens,
    onSourceTokenChange,
    onTargetTokenChange,
  } = useToken(currentChain);

  const usdcToken = useMemo(() => {
    return sourceTokens?.find((item) => item.symbol === "USDC");
  }, [sourceTokens]);

  const {
    dst,
    balance,
    allowance,
    depositFeeRevalidating,
    depositFee,
    quantity,
    setQuantity,
    approve,
    deposit,
    isNativeToken,
    balanceRevalidating,
    fetchBalance,
  } = useDeposit({
    address: sourceToken?.address,
    decimals: sourceToken?.decimals,
    srcChainId: currentChain?.id,
    srcToken: sourceToken?.symbol,
    dstToken: targetToken?.symbol,
    crossChainRouteAddress:
      currentChain?.info?.network_infos?.cross_chain_router,
    depositorAddress: currentChain?.info?.network_infos?.depositor,
  });

  const maxQuantity = useMemo(
    () =>
      new Decimal(balance || 0)
        .todp(sourceToken?.precision ?? 2, Decimal.ROUND_DOWN)
        .toString(),
    [balance, sourceToken?.precision],
  );

  const { inputStatus, hintMessage } = useInputStatus({
    quantity,
    maxQuantity,
  });

  const { needSwap, needCrossSwap } = useNeedSwapAndCross({
    srcToken: sourceToken,
    dstToken: targetToken,
    srcChainId: currentChain?.id,
    dstChainId: dst?.chainId,
  });

  const userMaxQtyMessage = useMemo(() => {
    if (
      sourceToken?.symbol === "USDC" ||
      sourceToken?.symbol !== targetToken?.symbol ||
      !sourceToken?.is_collateral ||
      !quantity ||
      isNaN(Number(quantity))
    ) {
      return "";
    }

    if (new Decimal(quantity).gt(sourceToken?.user_max_qty)) {
      return t("transfer.deposit.userMaxQty.error", {
        maxQty: sourceToken?.user_max_qty,
        token: sourceToken?.symbol,
      });
    }
    return "";
  }, [sourceToken, targetToken, quantity, t]);

  const {
    cleanTransactionInfo,
    onSwapDeposit,
    swapRevalidating,

    swapPrice,
    markPrice,
    swapQuantity,
    swapFee,
    warningMessage: swapWarningMessage,
    slippage,
    onSlippageChange,
  } = useSwapDeposit({
    srcToken: sourceToken!,
    currentChain,
    dst,
    quantity,
    isNativeToken,
    depositFee,
    setQuantity,
    needSwap,
    needCrossSwap,
  });

  const cleanData = useCallback(() => {
    setQuantity("");
    cleanTransactionInfo();
  }, [setQuantity]);

  const onSuccess = useCallback(() => {
    cleanData();
    options.onClose?.();
  }, [cleanData, options.onClose]);

  const { submitting, onApprove, onDeposit } = useDepositAction({
    quantity,
    allowance,
    approve,
    deposit,
    enableCustomDeposit: needSwap || needCrossSwap,
    customDeposit: onSwapDeposit,
    onSuccess,
  });

  const loading = submitting || depositFeeRevalidating!;

  const disabled =
    !quantity ||
    Number(quantity) === 0 ||
    !sourceToken ||
    inputStatus === "error" ||
    depositFeeRevalidating! ||
    swapRevalidating ||
    // if exceed collateral cap, disable deposit
    !!userMaxQtyMessage;

  const amount = useMemo(() => {
    const markPrice = 1;
    return new Decimal(quantity || 0).mul(markPrice).toNumber();
  }, [quantity]);

  const actionType = useActionType({
    isNativeToken,
    allowance,
    quantity,
    maxQuantity,
  });

  const fee = useDepositFee({
    nativeToken: currentChain?.info?.nativeToken,
    depositFee,
  });

  const {
    collateralRatio,
    collateralContributionQuantity,
    currentLTV,
    nextLTV,
    indexPrice,
    minimumReceived,
  } = useCollateralValue({
    tokens: sourceTokens,
    sourceToken,
    targetToken,
    qty: quantity,
    slippage,
  });

  const {
    ltv_threshold,
    negative_usdc_threshold,
    isLoading: isConvertThresholdLoading,
  } = useConvertThreshold();

  useEffect(() => {
    cleanData();
  }, [sourceToken, currentChain?.id]);

  const warningMessage = swapWarningMessage || userMaxQtyMessage;

  return {
    sourceToken,
    targetToken,
    sourceTokens,
    targetTokens,
    onSourceTokenChange,
    onTargetTokenChange,

    amount,
    isNativeToken,
    quantity,
    collateralContributionQuantity,
    maxQuantity,
    indexPrice,
    onQuantityChange: setQuantity,
    hintMessage,
    inputStatus,
    chains,
    currentChain,
    settingChain,
    onChainChange,
    actionType,
    onDeposit,
    onApprove,
    fetchBalance,
    dst,
    wrongNetwork,
    balanceRevalidating,
    loading,
    disabled,
    networkId,
    fee,
    collateralRatio,
    currentLTV,
    nextLTV,
    ltv_threshold,
    negative_usdc_threshold,
    isConvertThresholdLoading,
    slippage,
    onSlippageChange,
    minimumReceived,
    usdcToken,

    needSwap,
    needCrossSwap,
    swapPrice,
    markPrice,
    swapQuantity,
    swapFee,
    warningMessage,
    swapRevalidating,
  };
};

export type UseDepositFeeReturn = ReturnType<typeof useDepositFee>;

function useDepositFee(options: {
  nativeToken?: API.TokenInfo;
  depositFee?: bigint;
}) {
  const { nativeToken, depositFee = 0 } = options;
  const { account } = useAccount();

  const nativeSymbol = nativeToken?.symbol;

  const { data: symbolPrice } = useIndexPrice(`SPOT_${nativeSymbol}_USDC`);

  const feeProps = useMemo(() => {
    const dstGasFee = new Decimal(depositFee.toString())
      // todo solana is 9, evm is 18
      .div(
        new Decimal(10).pow(
          account.walletAdapter?.chainNamespace === ChainNamespace.solana
            ? 9
            : 18,
        ),
      )
      .toString();

    const feeAmount = new Decimal(dstGasFee).mul(symbolPrice || 0).toString();

    return {
      dstGasFee,
      feeQty: dstGasFee,
      feeAmount,
      dp: feeDecimalsOffset(4),
    };
  }, [depositFee, symbolPrice]);

  return { ...feeProps, nativeSymbol };
}

const useCollateralValue = (params: {
  tokens: API.TokenInfo[];
  sourceToken?: API.TokenInfo;
  targetToken?: API.TokenInfo;
  qty: string;
  slippage: number;
}) => {
  const { sourceToken, targetToken, slippage } = params;

  const quantity = Number(params.qty);

  const { data: holdingList = [], usdc } = useHoldingStream();
  const { data: indexPrices } = useIndexPricesStream();
  const [data] = usePositionStream(sourceToken?.symbol);
  const aggregated = useDataTap(data.aggregated);
  const unrealPnL = aggregated?.total_unreal_pnl ?? 0;

  const usdcBalance = usdc?.holding ?? 0;

  const indexPrice = useMemo(() => {
    if (sourceToken?.symbol === "USDC") {
      return 1;
    }
    const symbol = `PERP_${sourceToken?.symbol}_USDC`;
    return indexPrices[symbol] ?? 0;
  }, [sourceToken?.symbol, indexPrices]);

  const getCollateralRatio = useCallback(
    (inputQty: number) => {
      return collateralRatio({
        baseWeight: targetToken?.base_weight ?? 0,
        discountFactor: targetToken?.discount_factor ?? 0,
        collateralQty: new Decimal(inputQty).toNumber(),
        indexPrice: indexPrice,
      });
    },
    [targetToken, indexPrice],
  );

  const collateralContributionQuantity = collateralContribution({
    collateralQty: quantity,
    collateralRatio: getCollateralRatio(quantity),
    indexPrice: indexPrice,
  });

  const memoizedCurrentLTV = useMemo(() => {
    const value = LTV({
      usdcBalance: usdcBalance,
      upnl: unrealPnL,
      collateralAssets: holdingList
        .filter((h) => h.token !== "USDC")
        .map((item) => {
          const originalQty = item?.holding ?? 0;
          const _indexPrice = indexPrices[`PERP_${item.token}_USDC`] ?? 0;
          return {
            qty: originalQty,
            indexPrice: _indexPrice,
            weight: collateralRatio({
              baseWeight: targetToken?.base_weight ?? 0,
              discountFactor: targetToken?.discount_factor ?? 0,
              indexPrice: _indexPrice,
              collateralQty: originalQty,
            }),
          };
        }),
    });
    return new Decimal(value)
      .mul(100)
      .toDecimalPlaces(2, Decimal.ROUND_DOWN)
      .toNumber();
  }, [holdingList, usdcBalance, unrealPnL, indexPrices, targetToken]);

  const memoizedNextLTV = useMemo(() => {
    const value = LTV({
      usdcBalance: usdcBalance,
      upnl: unrealPnL,
      collateralAssets: holdingList
        .filter((h) => h.token !== "USDC")
        .map((item) => {
          const originalQty = item?.holding ?? 0;
          const _indexPrice = indexPrices[`PERP_${item.token}_USDC`] ?? 0;
          return {
            qty: originalQty,
            indexPrice: _indexPrice,
            weight: collateralRatio({
              baseWeight: targetToken?.base_weight ?? 0,
              discountFactor: targetToken?.discount_factor ?? 0,
              indexPrice: _indexPrice,
              collateralQty: quantity
                ? new Decimal(originalQty).add(quantity).toNumber()
                : originalQty,
            }),
          };
        }),
    });
    return new Decimal(value)
      .mul(100)
      .toDecimalPlaces(2, Decimal.ROUND_DOWN)
      .toNumber();
  }, [holdingList, usdcBalance, unrealPnL, indexPrices, quantity, targetToken]);

  const minimumReceived = calcMinimumReceived({
    amount: collateralContributionQuantity,
    slippage,
  });

  return {
    collateralRatio: getCollateralRatio(quantity),
    collateralContributionQuantity,
    currentLTV: memoizedCurrentLTV,
    nextLTV: memoizedNextLTV,
    indexPrice,
    minimumReceived,
  };
};

const useConvertThreshold = () => {
  const { data, error, isLoading } = useQuery<API.ConvertThreshold>(
    "/v1/public/auto_convert_threshold",
    {
      errorRetryCount: 3,
    },
  );
  return {
    ltv_threshold: data?.ltv_threshold,
    negative_usdc_threshold: data?.negative_usdc_threshold,
    isLoading,
    error,
  } as const;
};
