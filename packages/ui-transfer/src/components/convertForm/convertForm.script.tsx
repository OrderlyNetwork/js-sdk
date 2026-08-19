import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useConfig,
  useConvert,
  useComputedLTV,
  useEventEmitter,
  useLocalStorage,
  usePrivateQuery,
  useSessionStorage,
  useSwapQuote,
  useWalletConnector,
} from "@orderly.network/hooks";
import type { SwapQuoteError, SwapQuoteRequest } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import type { NetworkId } from "@orderly.network/types";
import { toast, ToastTile } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useSettlePnl } from "../unsettlePnlInfo/useSettlePnl";
import {
  createTrackedConvertRequest,
  findLatestPendingConvertRecord,
  findTrackedConvertRecord,
  getConvertIdFromResponse,
  getConvertReceivedAmount,
  getConvertTargetAmount,
  getEffectiveConvertStatus,
  getTrackedConvertRequestForAccount,
  normalizeConvertSlippage,
} from "./convertHistory";
import type {
  ConvertHistoryResponse,
  ConvertRequestOrigin,
  TrackedConvertRequest,
} from "./convertHistory";
import { useToken } from "./hooks/useToken";
import {
  calculateMinimumReceived,
  calculateQuoteRate,
  getQuoteTargetAmount,
} from "./quoteAmount";

export type ConvertFormScriptReturn = ReturnType<typeof useConvertFormScript>;

const ORDERLY_CONVERT_SLIPPAGE_KEY = "orderly_convert_slippage";
const ORDERLY_TRACKED_CONVERT_KEY = "orderly_tracked_convert";
const SWAP_QUOTE_DEBOUNCE_MS = 300;
const CONVERT_HISTORY_REFRESH_INTERVAL = 10_000;
const CONVERT_DELAY_WARNING_TIMEOUT = 20_000;
const CONVERT_HISTORY_URL = "/v1/asset/convert_history?page=1&size=20";

const getQuoteErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export interface ConvertFormScriptOptions {
  token?: string;
  close?: () => void;
}

interface TrackedConvertState {
  request: TrackedConvertRequest;
  origin: ConvertRequestOrigin;
}

export const useConvertFormScript = (options: ConvertFormScriptOptions) => {
  const { token: defaultToken } = options;

  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [persistedTrackedConvert, setPersistedTrackedConvert] =
    useSessionStorage<TrackedConvertState | null>(
      ORDERLY_TRACKED_CONVERT_KEY,
      null,
    );
  const [trackedConvert, setTrackedConvert] = useState<
    TrackedConvertState | undefined
  >(() => persistedTrackedConvert ?? undefined);
  const [isConvertDelayed, setIsConvertDelayed] = useState(false);
  const effectiveTrackedConvert = trackedConvert ?? persistedTrackedConvert;
  const trackedRequest = effectiveTrackedConvert?.request;
  const ee = useEventEmitter();

  const config = useConfig();

  const networkId = config.get("networkId") as NetworkId;

  const [quantity, setQuantity] = useState<string>("");

  const { wrongNetwork, connectWallet } = useAppContext();

  const { wallet } = useWalletConnector();

  const { sourceToken, sourceTokens, onSourceTokenChange, targetToken } =
    useToken({ defaultValue: defaultToken });

  const { walletName, address } = useMemo(
    () => ({
      walletName: wallet?.label,
      address: wallet?.accounts?.[0].address,
    }),
    [wallet],
  );

  const onQuantityChange = (qty: string) => {
    setQuantity(qty);
  };

  const [slippage, setSlippage] = useLocalStorage(
    ORDERLY_CONVERT_SLIPPAGE_KEY,
    0.5,
  );
  const normalizedSlippage = normalizeConvertSlippage(Number(slippage));

  useEffect(() => {
    if (normalizedSlippage !== slippage) {
      setSlippage(normalizedSlippage);
    }
  }, [normalizedSlippage, setSlippage, slippage]);

  const { state: accountState } = useAccount();
  const canQueryConvertHistory =
    accountState.status >= AccountStatusEnum.EnableTrading ||
    accountState.status === AccountStatusEnum.EnableTradingWithoutConnected;
  const currentTrackedRequest = getTrackedConvertRequestForAccount(
    trackedRequest,
    accountState.accountId,
  );

  useEffect(() => {
    if (!trackedConvert && persistedTrackedConvert) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTrackedConvert(persistedTrackedConvert);
    }
  }, [persistedTrackedConvert, trackedConvert]);

  useEffect(() => {
    // Reset transient status when the active account changes. The tracked
    // request is account-scoped and may still be restored when the account is
    // initialized after this component mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsConvertDelayed(false);
  }, [accountState.accountId]);

  const {
    data: convertHistory,
    error: convertHistoryError,
    isValidating: isConvertHistoryRefreshing,
    mutate: refreshConvertHistory,
  } = usePrivateQuery<ConvertHistoryResponse>(CONVERT_HISTORY_URL, {
    formatter: (data) => data,
    revalidateOnFocus: true,
    refreshInterval: (latestData?: ConvertHistoryResponse) => {
      const rows = latestData?.rows ?? [];

      if (currentTrackedRequest) {
        const trackedRecord = findTrackedConvertRecord(
          rows,
          currentTrackedRequest,
        );
        return !trackedRecord ||
          getEffectiveConvertStatus(trackedRecord) === "pending"
          ? CONVERT_HISTORY_REFRESH_INTERVAL
          : 0;
      }

      return findLatestPendingConvertRecord(rows)
        ? CONVERT_HISTORY_REFRESH_INTERVAL
        : 0;
    },
  });

  const convertHistoryRows = convertHistory?.rows ?? [];
  const latestPendingRecord = useMemo(
    () => findLatestPendingConvertRecord(convertHistoryRows),
    [convertHistoryRows],
  );
  const latestPendingRequest = useMemo<
    TrackedConvertRequest | undefined
  >(() => {
    if (!latestPendingRecord) {
      return undefined;
    }
    return {
      ...createTrackedConvertRequest(latestPendingRecord),
      accountId: accountState.accountId,
    };
  }, [accountState.accountId, latestPendingRecord]);

  useEffect(() => {
    if (!currentTrackedRequest && latestPendingRequest) {
      // Preserve the record id after it transitions out of the pending set.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTrackedConvert({
        request: latestPendingRequest,
        origin: "recovered",
      });
    }
  }, [currentTrackedRequest, latestPendingRequest]);

  const effectiveTrackedRequest = currentTrackedRequest ?? latestPendingRequest;

  useEffect(() => {
    const handleConvertChange = () => {
      void refreshConvertHistory();
    };

    ee.on("assetconvert:changed", handleConvertChange);
    return () => {
      ee.off("assetconvert:changed", handleConvertChange);
    };
  }, [ee, refreshConvertHistory]);

  const trackedRecord = useMemo(
    () =>
      effectiveTrackedRequest
        ? findTrackedConvertRecord(convertHistoryRows, effectiveTrackedRequest)
        : undefined,
    [convertHistoryRows, effectiveTrackedRequest],
  );
  const activeRecord = effectiveTrackedRequest
    ? trackedRecord
    : latestPendingRecord;
  const historyStatus = effectiveTrackedRequest
    ? trackedRecord
      ? getEffectiveConvertStatus(trackedRecord)
      : "pending"
    : activeRecord
      ? getEffectiveConvertStatus(activeRecord)
      : undefined;
  // A websocket event only signals that convert history has changed. The
  // history record and its transaction details remain the source of truth.
  const activeStatus = historyStatus;

  useEffect(() => {
    if (persistedTrackedConvert && activeStatus && activeStatus !== "pending") {
      setPersistedTrackedConvert(null);
    }
  }, [activeStatus, persistedTrackedConvert, setPersistedTrackedConvert]);

  const trackedRequestKey = effectiveTrackedRequest
    ? `${effectiveTrackedRequest.convertId ?? "new"}:${effectiveTrackedRequest.previousMaxConvertId}:${effectiveTrackedRequest.sourceToken}:${effectiveTrackedRequest.targetToken}`
    : undefined;

  useEffect(() => {
    if (!trackedRequestKey || activeStatus !== "pending") {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsConvertDelayed(true);
    }, CONVERT_DELAY_WARNING_TIMEOUT);

    return () => window.clearTimeout(timer);
  }, [activeStatus, trackedRequestKey]);

  const { maxAmount, convert } = useConvert({ token: sourceToken?.token });

  const onConvert = async () => {
    if (
      loading ||
      activeStatus === "pending" ||
      (canQueryConvertHistory && !convertHistory)
    ) {
      return;
    }
    setLoading(true);
    const requestSnapshot: TrackedConvertRequest = {
      accountId: accountState.accountId,
      previousMaxConvertId: convertHistoryRows.reduce(
        (max, record) => Math.max(max, record.convert_id),
        0,
      ),
      sourceToken: sourceToken?.token || "-",
      sourceAmount: quantity,
      targetToken: targetToken?.token || "USDC",
      targetAmount: memoizedOutAmounts,
    };
    return convert({
      amount: Number(quantity),
      slippage: new Decimal(normalizedSlippage).div(100).toNumber(),
    })
      .then((response) => {
        const nextTrackedConvert: TrackedConvertState = {
          request: {
            ...requestSnapshot,
            convertId: getConvertIdFromResponse(response),
          },
          origin: "submitted",
        };
        setTrackedConvert(nextTrackedConvert);
        setPersistedTrackedConvert(nextTrackedConvert);
        toast.success(
          <ToastTile
            title={t("transfer.convert.request")}
            subtitle={t("transfer.convert.request.description", {
              fromAmount: requestSnapshot.sourceAmount,
              fromToken: requestSnapshot.sourceToken,
              toAmount: requestSnapshot.targetAmount,
              toToken: requestSnapshot.targetToken,
            })}
          />,
        );
        void refreshConvertHistory();
      })
      .catch((err: Error) => {
        toast.error(
          err.message?.includes("user rejected")
            ? t("transfer.convert.failed")
            : err.message,
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onRefreshConvertStatus = () => {
    void refreshConvertHistory();
  };

  const [
    postQuote,
    { data: quoteData, reset: resetQuote, isMutating: isQuoteLoading },
  ] = useSwapQuote();

  const quoteRequest = useMemo<SwapQuoteRequest | null>(() => {
    if (
      !quantity ||
      new Decimal(quantity).lte(0) ||
      !sourceToken?.token ||
      !targetToken?.token
    ) {
      return null;
    }

    return {
      fromToken: sourceToken.token,
      toToken: targetToken.token,
      amount: new Decimal(quantity).toNumber(),
      slippage: new Decimal(normalizedSlippage).div(100).toNumber(),
    };
  }, [normalizedSlippage, quantity, sourceToken?.token, targetToken?.token]);

  useEffect(() => {
    resetQuote();

    if (!quoteRequest) {
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      postQuote(quoteRequest).catch((error) => {
        if (!active) {
          return;
        }

        const code = Number((error as SwapQuoteError)?.code);
        console.error("[convertForm] Swap quote failed:", error);
        toast.error(getQuoteErrorMessage(error));

        if (code === -1002) {
          void Promise.resolve(connectWallet()).catch((connectError) => {
            console.error(
              "[convertForm] Account recovery failed:",
              connectError,
            );
          });
        }
        resetQuote();
      });
    }, SWAP_QUOTE_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [connectWallet, postQuote, quoteRequest, resetQuote]);

  const isQuoteDataMatched = useMemo(() => {
    if (!quoteData || !quoteRequest) {
      return false;
    }

    const fromToken = quoteData.fromToken;
    const toToken = quoteData.toToken;

    if (
      !fromToken ||
      !toToken ||
      !fromToken.tokenAddress ||
      !toToken.tokenAddress ||
      !fromToken.amount ||
      !quoteData.gasEstimate ||
      typeof quoteData.expiresAt !== "number"
    ) {
      return false;
    }

    const targetAmount = getQuoteTargetAmount(
      toToken.estimatedValue,
      toToken.estimatedAmount,
      targetToken?.decimals,
    );

    return targetAmount !== "-" && quoteData.expiresAt > Date.now();
  }, [quoteData, quoteRequest, targetToken?.decimals]);

  useEffect(() => {
    if (quoteData && !isQuoteDataMatched) {
      resetQuote();
    }
  }, [isQuoteDataMatched, quoteData, resetQuote]);

  const quoteTargetAmount = useMemo(
    () =>
      quoteData
        ? getQuoteTargetAmount(
            quoteData.toToken.estimatedValue,
            quoteData.toToken.estimatedAmount,
            targetToken?.decimals,
          )
        : "-",
    [quoteData, targetToken?.decimals],
  );

  const memoizedOutAmounts = useMemo<string>(() => {
    if (quoteData && !isQuoteLoading && isQuoteDataMatched) {
      return quoteTargetAmount;
    }

    return "-";
  }, [isQuoteDataMatched, isQuoteLoading, quoteData, quoteTargetAmount]);

  const memoizedConvertRate = useMemo(() => {
    if (quoteData && quoteRequest && !isQuoteLoading && isQuoteDataMatched) {
      return calculateQuoteRate(quoteRequest.amount, quoteTargetAmount);
    }

    return "-";
  }, [
    isQuoteDataMatched,
    isQuoteLoading,
    quoteData,
    quoteRequest,
    quoteTargetAmount,
  ]);

  const memoizedMinimumReceived = useMemo<string>(() => {
    if (!quoteData || isQuoteLoading || !isQuoteDataMatched) {
      return "0";
    }

    const effectiveSlippage = Number(quoteData.slippageLimitPercent);
    if (!Number.isFinite(effectiveSlippage)) {
      return "0";
    }

    return calculateMinimumReceived(
      quoteTargetAmount,
      effectiveSlippage.toString(),
    );
  }, [quoteData, isQuoteDataMatched, isQuoteLoading, quoteTargetAmount]);

  useEffect(() => {
    if (!quoteData || !quoteRequest || !isQuoteDataMatched) {
      return;
    }

    const delay = Math.max(0, quoteData.expiresAt - Date.now());
    let active = true;
    const timer = window.setTimeout(() => {
      resetQuote();
      postQuote(quoteRequest).catch((error) => {
        if (!active) {
          return;
        }

        console.error(
          "[convertForm] Expired swap quote refresh failed:",
          error,
        );
        toast.error(getQuoteErrorMessage(error));
        resetQuote();
      });
    }, delay);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [isQuoteDataMatched, postQuote, quoteData, quoteRequest, resetQuote]);

  const currentLtv = useComputedLTV();

  const nextLTV = useComputedLTV({
    input: Number(quantity),
    token: sourceToken?.token,
  });

  const isCheckingConvertStatus =
    canQueryConvertHistory && !convertHistory && !convertHistoryError;
  const hasConvertStatusError =
    canQueryConvertHistory && !convertHistory && Boolean(convertHistoryError);
  const disabled =
    !quantity ||
    Number(quantity) === 0 ||
    isCheckingConvertStatus ||
    hasConvertStatusError ||
    activeStatus === "pending";

  const targetAmount = effectiveTrackedRequest
    ? getConvertTargetAmount(effectiveTrackedRequest.targetAmount)
    : "-";
  const activeConvertRequest = effectiveTrackedRequest
    ? {
        status: activeStatus,
        sourceToken: effectiveTrackedRequest.sourceToken,
        sourceAmount: effectiveTrackedRequest.sourceAmount,
        targetToken: effectiveTrackedRequest.targetToken,
        targetAmount,
        receivedAmount: trackedRecord
          ? getConvertReceivedAmount(trackedRecord)
          : targetAmount,
        isDelayed: isConvertDelayed,
      }
    : undefined;

  const { hasPositions, onSettlePnl } = useSettlePnl();

  return {
    walletName,
    address,
    quantity,
    onQuantityChange,
    token: sourceToken,
    sourceTokens,
    onSourceTokenChange,
    targetToken,
    balanceRevalidating: false,
    maxQuantity: maxAmount,
    disabled,
    loading,
    wrongNetwork,
    onConvert,
    hasPositions,
    onSettlePnl,
    networkId,
    slippage: normalizedSlippage,
    onSlippageChange: (value: number) =>
      setSlippage(normalizeConvertSlippage(value)),
    convertRate: memoizedConvertRate,
    minimumReceived: memoizedMinimumReceived,
    outAmounts: memoizedOutAmounts,
    isQuoteLoading,
    currentLTV: currentLtv,
    nextLTV: nextLTV,
    activeConvertRequest,
    isRecoveredConvertRequest:
      (Boolean(currentTrackedRequest) &&
        effectiveTrackedConvert?.origin === "recovered") ||
      (!currentTrackedRequest && Boolean(latestPendingRequest)),
    isCheckingConvertStatus,
    hasConvertStatusError,
    isConvertHistoryRefreshing,
    onRefreshConvertStatus,
  };
};
