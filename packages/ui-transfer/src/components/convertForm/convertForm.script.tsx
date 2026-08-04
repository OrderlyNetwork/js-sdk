import { useEffect, useMemo, useState } from "react";
import {
  useConfig,
  useConvert,
  useComputedLTV,
  useLocalStorage,
  useSwapQuote,
  useWalletConnector,
} from "@orderly.network/hooks";
import type { SwapQuoteError, SwapQuoteRequest } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import type { NetworkId } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useSettlePnl } from "../unsettlePnlInfo/useSettlePnl";
import { useToken } from "./hooks/useToken";
import {
  calculateMinimumReceived,
  calculateQuoteRate,
  getQuoteTokenDecimals,
  toRawQuoteAmount,
} from "./quoteAmount";

export type ConvertFormScriptReturn = ReturnType<typeof useConvertFormScript>;

const ORDERLY_CONVERT_SLIPPAGE_KEY = "orderly_convert_slippage";
const SWAP_QUOTE_DEBOUNCE_MS = 300;

const normalizeQuoteErrorCode = (code: number | string | undefined) => {
  if (typeof code === "string" && /^-?\d+$/.test(code)) {
    return Number(code);
  }

  return code;
};

const getQuoteErrorMessageKey = (code: number | string | undefined) => {
  switch (normalizeQuoteErrorCode(code)) {
    case -1005:
      return "transfer.convert.quoteInvalidParam";
    case -1040:
      return "transfer.convert.quoteChainUnsupported";
    case -1041:
      return "transfer.convert.quoteTokenPairUnsupported";
    case -1043:
      return "transfer.convert.quoteRejected";
    case -1042:
      return "transfer.convert.quoteUnavailable";
    case -1044:
      return "transfer.convert.quoteDisabled";
    case -1003:
      return "transfer.convert.quoteRateLimited";
    case -1010:
      return "transfer.convert.quoteExternalUnavailable";
    default:
      return "transfer.convert.quoteFailed";
  }
};

export interface ConvertFormScriptOptions {
  token?: string;
  close?: () => void;
}

export const useConvertFormScript = (options: ConvertFormScriptOptions) => {
  const { token: defaultToken, close } = options;

  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);

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

  const { maxAmount, convert } = useConvert({ token: sourceToken?.token });

  const onConvert = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    return convert({
      amount: Number(quantity),
      slippage: new Decimal(slippage).div(100).toNumber(),
    })
      .then(() => {
        toast.success(t("transfer.convert.completed"));
        close?.();
        setQuantity("");
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
      slippage: new Decimal(slippage).div(100).toNumber(),
    };
  }, [quantity, slippage, sourceToken?.token, targetToken?.token]);

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

        const code = normalizeQuoteErrorCode((error as SwapQuoteError)?.code);
        console.error("[convertForm] Swap quote failed:", error);

        if (code === -1002) {
          toast.error(t("connector.createAccount"));
          void Promise.resolve(connectWallet()).catch((connectError) => {
            console.error(
              "[convertForm] Account recovery failed:",
              connectError,
            );
          });
        } else {
          toast.error(t(getQuoteErrorMessageKey(code)));
        }
        resetQuote();
      });
    }, SWAP_QUOTE_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [postQuote, quoteRequest, resetQuote, t]);

  const isQuoteDataMatched = useMemo(() => {
    if (!quoteData || !quoteRequest) {
      return false;
    }

    const fromToken = quoteData.fromToken;
    const toToken = quoteData.toToken;
    // Quote raw amounts use logical token decimals, not chain_details decimals.
    const sourceDecimals = getQuoteTokenDecimals(sourceToken);

    if (
      !fromToken ||
      !toToken ||
      !fromToken.tokenAddress ||
      !toToken.tokenAddress ||
      !fromToken.amount ||
      !toToken.estimatedAmount ||
      !quoteData.gasEstimate ||
      typeof quoteData.expiresAt !== "number"
    ) {
      return false;
    }

    return (
      fromToken.amount ===
        toRawQuoteAmount(quoteRequest.amount, sourceDecimals) &&
      quoteData.expiresAt > Date.now()
    );
  }, [quoteData, quoteRequest, sourceToken]);

  useEffect(() => {
    if (quoteData && !isQuoteDataMatched) {
      resetQuote();
    }
  }, [isQuoteDataMatched, quoteData, resetQuote]);

  const memoizedOutAmounts = useMemo<string>(() => {
    if (quoteData && !isQuoteLoading && isQuoteDataMatched) {
      return quoteData.toToken.estimatedAmount;
    }

    return "-";
  }, [quoteData, isQuoteDataMatched, isQuoteLoading]);

  const memoizedConvertRate = useMemo(() => {
    if (quoteData && !isQuoteLoading && isQuoteDataMatched) {
      return calculateQuoteRate(
        quoteData.fromToken.amount,
        quoteData.toToken.estimatedAmount,
        getQuoteTokenDecimals(sourceToken),
        getQuoteTokenDecimals(targetToken),
      );
    }

    return "-";
  }, [isQuoteDataMatched, isQuoteLoading, quoteData, sourceToken, targetToken]);

  const memoizedMinimumReceived = useMemo<string>(() => {
    if (!quoteData || isQuoteLoading || !isQuoteDataMatched) {
      return "0";
    }

    const effectiveSlippage = Number(quoteData.slippageLimitPercent);
    if (!Number.isFinite(effectiveSlippage)) {
      return "0";
    }

    return calculateMinimumReceived(
      quoteData.toToken.estimatedAmount,
      effectiveSlippage.toString(),
    );
  }, [quoteData, isQuoteDataMatched, isQuoteLoading]);

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
        toast.error(t("transfer.convert.quoteFailed"));
        resetQuote();
      });
    }, delay);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [isQuoteDataMatched, postQuote, quoteData, quoteRequest, resetQuote, t]);

  const currentLtv = useComputedLTV();

  const nextLTV = useComputedLTV({
    input: Number(quantity),
    token: sourceToken?.token,
  });

  const disabled = !quantity || Number(quantity) === 0;

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
    slippage,
    onSlippageChange: setSlippage,
    convertRate: memoizedConvertRate,
    minimumReceived: memoizedMinimumReceived,
    outAmounts: memoizedOutAmounts,
    quoteDetails:
      quoteData && isQuoteDataMatched && !isQuoteLoading
        ? {
            priceImpactPercent: quoteData.priceImpactPercent,
            estimatedGasFeeValue: quoteData.gasEstimate.estimatedFeeValue,
            expiresAt: quoteData.expiresAt,
          }
        : null,
    isQuoteLoading,
    currentLTV: currentLtv,
    nextLTV: nextLTV,
  };
};
