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
import { useTranslation, Trans } from "@orderly.network/i18n";
import { account as accountPerp } from "@orderly.network/perp";
import { useAppContext } from "@orderly.network/react-app";
import {
  API,
  NetworkId,
  ChainNamespace,
  isNativeTokenChecker,
} from "@orderly.network/types";
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
  const { account } = useAccount();
  const networkId = useConfig("networkId") as NetworkId;

  const [feeWarningMessage, setFeeWarningMessage] = useState("");
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>(
    {},
  );

  const { chains, currentChain, settingChain, onChainChange } =
    useChainSelect();

  const {
    sourceToken,
    targetToken,
    sourceTokens,
    targetTokens,
    onSourceTokenChange,
    setSourceToken,
    onTargetTokenChange,
    sourceTokenUpdatedRef,
  } = useToken(currentChain);

  const { data: indexPrices, getIndexPrice } = useIndexPricesStream();

  const indexPrice = useMemo(() => {
    return getIndexPrice(sourceToken?.symbol ?? "") ?? 0;
  }, [sourceToken?.symbol, indexPrices]);

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
    fetchBalances,
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

  const maxDepositAmount = useMemo(() => {
    const balanceDecimal = new Decimal(balance || 0).todp(
      sourceToken?.precision ?? 2,
      Decimal.ROUND_DOWN,
    );

    // If user_max_qty is -1, ignore it and use balance only
    if (sourceToken?.user_max_qty === -1 || !sourceToken?.user_max_qty) {
      return balanceDecimal.toString();
    }

    const userMaxQty = new Decimal(sourceToken.user_max_qty).todp(
      sourceToken?.precision ?? 2,
      Decimal.ROUND_DOWN,
    );

    return balanceDecimal.lt(userMaxQty)
      ? balanceDecimal.toString()
      : userMaxQty.toString();
  }, [balance, sourceToken?.precision, sourceToken?.user_max_qty]);

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
      return (
        <Trans
          i18nKey="transfer.deposit.userMaxQty.error"
          values={{
            token: sourceToken?.symbol,
            chain: currentChain?.info?.network_infos?.name || "",
          }}
          components={[
            <a
              key="0"
              href="https://orderly.network/docs/introduction/trade-on-orderly/multi-collateral#max-deposits-global"
              target="_blank"
              rel="noopener noreferrer"
              className="oui-text-primary"
            />,
          ]}
        />
      );
    }
    return "";
  }, [sourceToken, targetToken, quantity, currentChain, t]);

  const loading = submitting || depositFeeRevalidating!;

  const nativeSymbol = useMemo(() => {
    return currentChain?.info?.nativeToken?.symbol;
  }, [currentChain]);

  const fee = useDepositFee({
    nativeSymbol: nativeSymbol,
    depositFee,
  });

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

  const {
    collateralRatio,
    collateralContributionQuantity,
    currentLTV,
    nextLTV,
  } = useCollateralValue({
    tokens: sourceTokens,
    sourceToken,
    targetToken,
    qty: quantity,
    indexPrice,
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
      !depositFeeRevalidating &&
      account.walletAdapter?.chainNamespace !== ChainNamespace.solana
    ) {
      setFeeWarningMessage(t("transfer.deposit.feeUnavailable"));
    } else {
      setFeeWarningMessage("");
    }
  }, [quantity, depositFee, depositFeeRevalidating, t, account]);

  const insufficientBalance = useMemo(() => {
    if (quantity && Number(quantity) > 0) {
      return new Decimal(quantity).gt(maxQuantity);
    }
    return false;
  }, [quantity, maxQuantity]);

  const insufficientGasMessage = useMemo(() => {
    if (
      nativeSymbol &&
      quantity &&
      Number(quantity) > 0 &&
      // when insufficient balance, the input status is error, so we don't need to check gas balance
      !insufficientBalance &&
      !depositFeeRevalidating &&
      tokenBalances &&
      (account.walletAdapter?.chainNamespace === ChainNamespace.solana ||
        fee.dstGasFee)
    ) {
      // TODO: update token balance when open select token list
      const nativeTokenBalance = tokenBalances[nativeSymbol] || "0";
      const notEnoughGas = new Decimal(nativeTokenBalance).lt(fee.dstGasFee);

      // when solana, if fee.dstGasFee is 0, and nativeTokenBalance is 0, it means the balance is not balance
      const isNotSolBalance =
        Number(fee.dstGasFee) === 0 &&
        Number(nativeTokenBalance) == Number(fee.dstGasFee);

      if (notEnoughGas || isNotSolBalance) {
        return t("transfer.deposit.notEnoughGas", {
          token: nativeSymbol,
        });
      }
    }

    return "";
  }, [
    fee.dstGasFee,
    quantity,
    depositFeeRevalidating,
    t,
    nativeSymbol,
    insufficientBalance,
    account,
  ]);

  const warningMessage =
    swapWarningMessage ||
    userMaxQtyMessage ||
    gasFeeMessage ||
    feeWarningMessage ||
    insufficientGasMessage;

  const hasUserMaxQtyError = !!userMaxQtyMessage;
  const finalInputStatus = hasUserMaxQtyError ? "error" : inputStatus;
  const finalHintMessage = hasUserMaxQtyError
    ? t("transfer.deposit.exceedCap")
    : hintMessage;

  const disabled =
    !quantity ||
    Number(quantity) === 0 ||
    !sourceToken ||
    inputStatus === "error" ||
    depositFeeRevalidating! ||
    swapRevalidating ||
    // if exceed collateral cap, disable deposit
    !!userMaxQtyMessage ||
    !!feeWarningMessage ||
    !!insufficientGasMessage;

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

  useEffect(() => {
    if (sourceTokens?.length > 0 && fetchBalances) {
      fetchBalances(sourceTokens)
        .then((balances) => {
          setTokenBalances(balances);
        })
        .catch((error) => {
          console.error("Failed to fetch balances:", error);
        });
    }
  }, [sourceTokens]);

  const sortedSourceTokens = useMemo(() => {
    return sortTokens(sourceTokens, tokenBalances, getIndexPrice);
  }, [sourceTokens, tokenBalances]);

  useEffect(() => {
    if (!sourceTokenUpdatedRef.current && sortedSourceTokens?.[0]) {
      setSourceToken(sortedSourceTokens[0]);
    }
  }, [sortedSourceTokens]);

  return {
    sourceToken,
    targetToken,
    sourceTokens: sortedSourceTokens,
    targetTokens,
    onSourceTokenChange,
    onTargetTokenChange,

    amount,
    nativeSymbol,
    isNativeToken,
    quantity,
    collateralContributionQuantity,
    maxQuantity,
    maxDepositAmount,
    indexPrice,
    onQuantityChange: setQuantity,
    hintMessage: finalHintMessage,
    inputStatus: finalInputStatus,
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
    tokenBalances,
  };
};

export type UseDepositFeeReturn = ReturnType<typeof useDepositFee>;

function useDepositFee(options: {
  nativeSymbol?: string;
  depositFee?: bigint;
}) {
  const { nativeSymbol, depositFee = 0 } = options;
  const { account } = useAccount();

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

  return feeProps;
}

const useCollateralValue = (params: {
  tokens: API.TokenInfo[];
  sourceToken?: API.TokenInfo;
  targetToken?: API.TokenInfo;
  qty: string;
  indexPrice: number;
}) => {
  const { sourceToken, targetToken, indexPrice } = params;

  const quantity = Number(params.qty);

  const memoizedCollateralRatio = useMemo(() => {
    return collateralRatio({
      baseWeight: targetToken?.base_weight ?? 0,
      discountFactor: targetToken?.discount_factor ?? 0,
      collateralQty: quantity,
      collateralCap: sourceToken?.user_max_qty ?? quantity,
      indexPrice,
    });
  }, [targetToken, quantity, sourceToken?.user_max_qty, indexPrice]);

  const collateralContributionQuantity = collateralContribution({
    collateralQty: quantity,
    collateralCap: sourceToken?.user_max_qty ?? quantity,
    collateralRatio: memoizedCollateralRatio.toNumber(),
    indexPrice,
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

const sortTokens = (
  tokens: API.TokenInfo[] = [],
  tokenBalances: Record<string, string> = {},
  getIndexPrice: (token: string) => number,
) => {
  const list = tokens.map((item) => {
    const indexPrice = getIndexPrice(item.symbol!);
    const balance = new Decimal(tokenBalances[item.symbol!] || 0)
      .mul(indexPrice || 1)
      .todp(item.precision || 2)
      .toNumber();

    return {
      ...item,
      balance,
      isNativeToken: isNativeTokenChecker(item.address!),
    };
  });

  return list.sort((a, b) => {
    const hasBalanceA = a.balance > 0;
    const hasBalanceB = b.balance > 0;

    // Tokens with balance come first
    if (hasBalanceA !== hasBalanceB) {
      return hasBalanceA ? -1 : 1;
    }

    // 1. USDC has highest priority
    if (a.symbol === "USDC" && b.symbol !== "USDC") return -1;
    if (b.symbol === "USDC" && a.symbol !== "USDC") return 1;

    // 2. USDC.e has second priority
    if (a.symbol === "USDC.e" && b.symbol !== "USDC.e") return -1;
    if (b.symbol === "USDC.e" && a.symbol !== "USDC.e") return 1;

    // 3. Native tokens have third priority
    if (a.isNativeToken && !b.isNativeToken) return -1;
    if (b.isNativeToken && !a.isNativeToken) return 1;

    // 4. If both have balance, sort by balance amount (high to low)
    if (hasBalanceA && hasBalanceB) {
      return b.balance - a.balance;
    }

    // 5. If both have no balance, sort alphabetically
    return (a.symbol || "").localeCompare(b.symbol || "");
  });
};
