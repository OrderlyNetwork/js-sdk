import { useCallback, useEffect, useMemo } from "react";
import {
  useAccount,
  useConfig,
  useDeposit,
  useIndexPricesStream,
  useOrderlyContext,
} from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { NetworkId } from "@orderly.network/types";
import { useAuthGuard } from "@orderly.network/ui-connector";
import { Decimal } from "@orderly.network/utils";
import { useActionType } from "./hooks/useActionType";
import { useChainSelect } from "./hooks/useChainSelect";
import { useCollateralValue } from "./hooks/useCollateralValue";
import { useConvertThreshold } from "./hooks/useConvertThreshold";
import { useDepositAction } from "./hooks/useDepositAction";
import { useDepositFee } from "./hooks/useDepositFee";
import { useDepositValidation } from "./hooks/useDepositValidation";
import { useMaxDepositAmount } from "./hooks/useMaxDepositAmount";
import { useNativeBalance } from "./hooks/useNativeBalance";
import { useOrderlyTokens } from "./hooks/useOrderlyTokens";
import { useToken } from "./hooks/useToken";
import { useTokenBalances } from "./hooks/useTokenBalances";
import { SWAP_CONTRACT_ADDRESS } from "./swap/helper";
import { useSwapTokens } from "./swap/use1inchTokens";
import { useSwapDeposit } from "./swap/useSwapDeposit";
import { filterAndSortTokens } from "./utils";

export type DepositFormScriptReturn = ReturnType<typeof useDepositFormScript>;

export type DepositFormScriptOptions = {
  close?: () => void;
};

export const useDepositFormScript = (options: DepositFormScriptOptions) => {
  const { wrongNetwork } = useAppContext();
  const { enableSwapDeposit } = useOrderlyContext();
  const { account } = useAccount();
  const networkId = useConfig("networkId") as NetworkId;

  const { chains, currentChain, settingChain, onChainChange } =
    useChainSelect();

  const swapTokens = useSwapTokens(currentChain?.id, enableSwapDeposit);
  const orderlyTokens = useOrderlyTokens(currentChain);

  const {
    sourceToken,
    targetToken,
    sourceTokens,
    targetTokens,
    onSourceTokenChange,
    setSourceTokens,
    onTargetTokenChange,
  } = useToken(orderlyTokens);

  const { data: indexPrices, getIndexPrice } = useIndexPricesStream();

  const {
    balance,
    allowance,
    depositFee,
    balanceRevalidating,
    depositFeeRevalidating,
    quantity,
    setQuantity,
    approve,
    deposit,
    fetchBalance,
    fetchBalances,
    targetChain,
    isNativeToken,
  } = useDeposit({
    address: sourceToken?.address,
    decimals: sourceToken?.decimals,
    srcChainId: currentChain?.id,
    srcToken: sourceToken?.symbol,
    dstToken: targetToken?.symbol,
    depositorAddress: enableSwapDeposit ? SWAP_CONTRACT_ADDRESS : undefined,
  });

  const { balance: nativeBalance, isLoading: nativeBalanceRevalidating } =
    useNativeBalance({
      fetchBalance,
      targetChain,
    });

  const { balances: tokenBalances, isLoading: batchBalancesRevalidating } =
    useTokenBalances({ orderlyTokens, swapTokens, fetchBalances });

  useEffect(() => {
    const sortedTokens = filterAndSortTokens(
      orderlyTokens,
      swapTokens,
      tokenBalances,
      getIndexPrice,
    );
    setSourceTokens(sortedTokens);
  }, [orderlyTokens, swapTokens, tokenBalances]);

  const maxQuantity = useMemo(
    () =>
      new Decimal(balance || 0)
        .todp(sourceToken?.precision ?? 2, Decimal.ROUND_DOWN)
        .toString(),
    [balance, sourceToken?.precision],
  );

  const maxDepositAmount = useMaxDepositAmount(sourceToken, balance);

  const nativeSymbol = useMemo(() => {
    return currentChain?.info?.nativeToken?.symbol;
  }, [currentChain]);

  const needSwap = useMemo(() => {
    return (
      !!sourceToken?.symbol &&
      !!targetToken?.symbol &&
      sourceToken.symbol !== targetToken?.symbol
    );
  }, [sourceToken, targetToken]);

  const {
    swapPrice,
    swapQuantity,
    swapMinReceived,
    swapPriceRevalidating,
    slippage,
    onSlippageChange,
    onSwapDeposit,
    error: swapErrorMessage,
  } = useSwapDeposit({
    sourceToken,
    targetToken,
    currentChain,
    quantity,
    depositFee,
  });

  const onDepositSuccess = useCallback(() => {
    setQuantity("");
    options.close?.();
  }, []);

  const {
    isMutating: depositRevalidating,
    depositError,
    setDepositError,
    onApprove,
    onDeposit,
    onApproveAndDeposit,
  } = useDepositAction({
    quantity,
    approve,
    deposit,
    needSwap,
    swapDeposit: onSwapDeposit,
    onSuccess: onDepositSuccess,
  });

  useEffect(() => {
    setQuantity("");
    setDepositError("");
    // when sourceToken or currentChain?.id changes, clean state
  }, [sourceToken, currentChain?.id]);

  const fee = useDepositFee({ nativeSymbol, depositFee, getIndexPrice });

  const targetQuantity = useMemo(() => {
    if (needSwap) {
      return swapQuantity
        ? new Decimal(swapQuantity)
            ?.todp(targetToken?.precision ?? 6, Decimal.ROUND_DOWN)
            .toString()
        : undefined;
    }
    return quantity;
  }, [needSwap, swapQuantity, quantity]);

  const {
    inputStatus,
    hintMessage,
    validationMessage,
    depositDisabled,
    targetInputStatus,
    targetHintMessage,
    showSourceDepositCap,
    showTargetDepositCap,
    slippageValidate,
  } = useDepositValidation({
    sourceToken,
    targetToken,
    quantity,
    targetQuantity,
    maxQuantity,
    isNativeToken,
    depositFee,
    depositFeeRevalidating,
    nativeBalanceRevalidating,
    dstGasFee: fee.dstGasFee,
    nativeSymbol,
    nativeBalance,
    account,
    currentChain,
    depositError,
    needSwap,
  });

  const swapPriceInUSD = useMemo(() => {
    if (swapPrice) {
      const indexPrice = getIndexPrice(targetToken?.symbol!);
      return indexPrice
        ? new Decimal(swapPrice)
            .mul(indexPrice)
            ?.todp(2, Decimal.ROUND_DOWN)
            .toString()
        : undefined;
    }
  }, [swapPrice, targetToken]);

  const usdcToken = useMemo(() => {
    return sourceTokens?.find((item) => item.symbol === "USDC");
  }, [sourceTokens]);

  const actionType = useActionType({ allowance, quantity, maxQuantity });

  const isLoggedIn = useAuthGuard();

  const indexPrice = useMemo(() => {
    return getIndexPrice(sourceToken?.symbol ?? "") ?? 0;
  }, [sourceToken?.symbol, indexPrices]);

  const swapIndexPrice = useMemo(() => {
    return indexPrice;
    // let swapIndexPrice revalidate when swapPrice changes, so we don't need to add indexPrice to dependencies
  }, [swapPrice]);

  const {
    collateralRatio,
    collateralContributionQuantity,
    currentLTV,
    nextLTV,
  } = useCollateralValue({
    sourceToken,
    targetToken,
    quantity,
    indexPrice: needSwap ? swapIndexPrice : indexPrice,
  });

  const {
    ltv_threshold,
    negative_usdc_threshold,
    isLoading: isConvertThresholdLoading,
  } = useConvertThreshold();

  const loading =
    depositFeeRevalidating || depositRevalidating || swapPriceRevalidating;

  const disabled =
    !sourceToken ||
    !quantity ||
    Number(quantity) === 0 ||
    depositDisabled ||
    loading ||
    !!swapErrorMessage;

  const targetQuantityLoading = swapPriceRevalidating;

  const warningMessage = validationMessage || swapErrorMessage;

  return {
    sourceToken,
    targetToken,
    sourceTokens,
    targetTokens,
    onSourceTokenChange,
    onTargetTokenChange,

    nativeSymbol,
    isNativeToken,
    quantity,
    collateralContributionQuantity,
    maxQuantity,
    maxDepositAmount,
    onQuantityChange: setQuantity,
    hintMessage,
    inputStatus,
    targetInputStatus,
    targetHintMessage,
    chains,
    currentChain,
    settingChain,
    onChainChange,
    actionType,
    onDeposit,
    onApprove,
    onApproveAndDeposit,
    wrongNetwork,
    balanceRevalidating,
    batchBalancesRevalidating,
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
    slippageValidate,
    swapMinReceived,
    usdcToken,

    needSwap,
    swapPrice,
    swapPriceInUSD,
    warningMessage,
    targetQuantity,
    targetQuantityLoading,

    isLoggedIn,
    showSourceDepositCap,
    showTargetDepositCap,
  };
};
