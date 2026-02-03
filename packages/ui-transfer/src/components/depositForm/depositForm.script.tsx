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
import { useActionType } from "./hooks/useActionType";
import { useChainSelect } from "./hooks/useChainSelect";
import { useCollateralValue } from "./hooks/useCollateralValue";
import { useConvertThreshold } from "./hooks/useConvertThreshold";
import { useDepositAction } from "./hooks/useDepositAction";
import { useDepositFee } from "./hooks/useDepositFee";
import { useDepositFormQuantities } from "./hooks/useDepositQuantities";
import { useDepositValidation } from "./hooks/useDepositValidation";
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

  const { getIndexPrice } = useIndexPricesStream();

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

  const {
    maxQuantity,
    maxDepositAmount,
    targetQuantity,
    swapPriceInUSD,
    quantityNotional,
    indexPrice,
    swapIndexPrice,
  } = useDepositFormQuantities({
    sourceToken,
    targetToken,
    balance,
    quantity,
    needSwap,
    swapQuantity,
    swapPrice,
    getIndexPrice,
  });

  const nativeSymbol = useMemo(() => {
    return currentChain?.info?.nativeToken?.symbol;
  }, [currentChain]);

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

  const usdcToken = useMemo(() => {
    return sourceTokens?.find((item) => item.symbol === "USDC");
  }, [sourceTokens]);

  const actionType = useActionType({ allowance, quantity, maxQuantity });

  const isLoggedIn = useAuthGuard();

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
    quantityNotional,
  };
};
