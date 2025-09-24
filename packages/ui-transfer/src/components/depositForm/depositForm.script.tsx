import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useConfig,
  useComputedLTV,
  useDeposit,
  useIndexPrice,
  useIndexPricesStream,
  useQuery,
  useTokenInfo,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { account as accountPerp } from "@orderly.network/perp";
import { useAppContext } from "@orderly.network/react-app";
import { API, NetworkId, ChainNamespace } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { useNeedSwapAndCross } from "../swap/hooks/useNeedSwapAndCross";
import { useSwapDeposit } from "../swap/hooks/useSwapDeposit";
import {
  useActionType,
  useChainSelect,
  useDepositAction,
  useInputStatus,
} from "./hooks";
import { useToken } from "./hooks/useToken";

const { collateralRatio, collateralContribution, calcMinimumReceived } =
  accountPerp;

export type DepositFormScriptReturn = ReturnType<typeof useDepositFormScript>;

export type DepositFormScriptOptions = {
  close?: () => void;
};
// swap to usdc precision is 3
export const SWAP_USDC_PRECISION = 3;

export const useDepositFormScript = (options: DepositFormScriptOptions) => {
  const { wrongNetwork } = useAppContext();
  const { t } = useTranslation();

  const networkId = useConfig("networkId") as NetworkId;

  const [feeWarningMessage, setFeeWarningMessage] = useState("");

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
    options.close?.();
  }, [cleanData, options.close]);

  const { submitting, onApprove, onDeposit, onApproveAndDeposit } =
    useDepositAction({
      quantity,
      allowance,
      approve,
      deposit,
      enableCustomDeposit: needSwap || needCrossSwap,
      customDeposit: onSwapDeposit,
      onSuccess,
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

  const loading = submitting || depositFeeRevalidating!;

  const disabled =
    !quantity ||
    Number(quantity) === 0 ||
    !sourceToken ||
    inputStatus === "error" ||
    depositFeeRevalidating! ||
    swapRevalidating ||
    // if exceed collateral cap, disable deposit
    !!userMaxQtyMessage ||
    !!feeWarningMessage;

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
  } = useCollateralValue({
    tokens: sourceTokens,
    sourceToken,
    targetToken,
    qty: quantity,
  });

  const {
    ltv_threshold,
    negative_usdc_threshold,
    isLoading: isConvertThresholdLoading,
  } = useConvertThreshold();

  useEffect(() => {
    cleanData();
  }, [sourceToken, currentChain?.id]);

  const gasFeeMessage = useMemo(() => {
    if (isNativeToken && maxQuantity === quantity) {
      return t("transfer.deposit.gasFee.error", {
        token: sourceToken?.symbol,
      });
    }
  }, [maxQuantity, quantity, sourceToken?.symbol, t]);

  useEffect(() => {
    if (
      quantity &&
      Number(quantity) > 0 &&
      depositFee === 0n &&
      !depositFeeRevalidating
    ) {
      setFeeWarningMessage(t("transfer.deposit.failed.fee"));
    } else {
      setFeeWarningMessage("");
    }
  }, [quantity, depositFee, depositFeeRevalidating, t]);

  const warningMessage =
    swapWarningMessage ||
    userMaxQtyMessage ||
    gasFeeMessage ||
    feeWarningMessage;

  // const isCollateralNativeToken = useMemo(() => {
  //   return (
  //     sourceToken?.is_collateral &&
  //     sourceToken?.symbol === targetToken?.symbol &&
  //     isNativeToken &&
  //     !needSwap &&
  //     !needCrossSwap
  //   );
  // }, [sourceToken, targetToken, isNativeToken, needSwap, needCrossSwap]);

  const targetQuantity = useMemo(() => {
    if (needSwap) {
      return swapQuantity
        ? new Decimal(swapQuantity)
            ?.todp(SWAP_USDC_PRECISION, Decimal.ROUND_DOWN)
            .toString()
        : swapQuantity;
    }
    return quantity;
  }, [needSwap, swapQuantity, quantity]);

  // only swap deposit show minimum received
  const minimumReceived = useMemo(() => {
    if (!swapQuantity) {
      return "-";
    }
    return calcMinimumReceived({
      amount: Number(swapQuantity),
      slippage,
    });
  }, [swapQuantity, slippage]);

  const targetQuantityLoading = swapRevalidating;

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
    onApproveAndDeposit,
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
    swapFee,
    warningMessage,
    targetQuantity,
    targetQuantityLoading,
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
  const tokenInfo = useTokenInfo(nativeSymbol!);

  const { data: indexPrice } = useIndexPrice(`SPOT_${nativeSymbol}_USDC`);

  const feeProps = useMemo(() => {
    // deposit fee is native token, so decimals is 18
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

    const feeAmount = new Decimal(dstGasFee).mul(indexPrice || 0).toString();

    return {
      dstGasFee,
      feeQty: dstGasFee,
      feeAmount,
      // dp: feeDecimalsOffset(4),
      dp: tokenInfo?.decimals || 8,
    };
  }, [depositFee, indexPrice]);

  return { ...feeProps, nativeSymbol };
}

const useCollateralValue = (params: {
  tokens: API.TokenInfo[];
  sourceToken?: API.TokenInfo;
  targetToken?: API.TokenInfo;
  qty: string;
}) => {
  const { sourceToken, targetToken } = params;

  const quantity = Number(params.qty);

  const { data: indexPrices } = useIndexPricesStream();

  const indexPrice = useMemo(() => {
    if (sourceToken?.symbol === "USDC") {
      return 1;
    }
    const symbol = `PERP_${sourceToken?.symbol}_USDC`;
    return indexPrices[symbol] ?? 0;
  }, [sourceToken?.symbol, indexPrices]);

  const memoizedCollateralRatio = useMemo(() => {
    return collateralRatio({
      baseWeight: targetToken?.base_weight ?? 0,
      discountFactor: targetToken?.discount_factor ?? 0,
      collateralQty: quantity,
      collateralCap: sourceToken?.user_max_qty ?? quantity,
      indexPrice: indexPrice,
    });
  }, [targetToken, quantity, sourceToken?.user_max_qty, indexPrice]);

  const collateralContributionQuantity = collateralContribution({
    collateralQty: quantity,
    collateralCap: sourceToken?.user_max_qty ?? quantity,
    collateralRatio: memoizedCollateralRatio.toNumber(),
    indexPrice: indexPrice,
  });

  const currentLtv = useComputedLTV();

  const nextLTV = useComputedLTV({
    input: quantity,
    token: sourceToken?.symbol,
  });

  return {
    collateralRatio: memoizedCollateralRatio.toNumber(),
    collateralContributionQuantity,
    currentLTV: currentLtv,
    nextLTV: nextLTV,
    indexPrice,
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
