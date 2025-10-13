import { useEffect, useMemo, useState } from "react";
import {
  useConfig,
  useConvert,
  useComputedLTV,
  useLocalStorage,
  useOdosQuote,
  useWalletConnector,
} from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { account } from "@kodiak-finance/orderly-perp";
import { useAppContext } from "@kodiak-finance/orderly-react-app";
import { nativeETHAddress, nativeTokenAddress } from "@kodiak-finance/orderly-types";
import type { API, NetworkId } from "@kodiak-finance/orderly-types";
import { toast } from "@kodiak-finance/orderly-ui";
import { Decimal } from "@kodiak-finance/orderly-utils";
import { useSettlePnl } from "../unsettlePnlInfo/useSettlePnl";
import { useToken } from "./hooks/useToken";

const { calcMinimumReceived } = account;

export type ConvertFormScriptReturn = ReturnType<typeof useConvertFormScript>;

const ORDERLY_CONVERT_SLIPPAGE_KEY = "orderly_convert_slippage";

export interface ConvertFormScriptOptions {
  token?: string;
  close?: () => void;
}

export const normalizeAmount = (amount: string, decimals: number) => {
  return new Decimal(amount).mul(new Decimal(10).pow(decimals)).toFixed(0);
};

export const unnormalizeAmount = (amount: string, decimals: number) => {
  return new Decimal(amount).div(new Decimal(10).pow(decimals)).toString();
};

export const useConvertFormScript = (options: ConvertFormScriptOptions) => {
  const { token: defaultToken, close } = options;

  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);

  const config = useConfig();

  const networkId = config.get("networkId") as NetworkId;

  const [quantity, setQuantity] = useState<string>("");

  const { wrongNetwork } = useAppContext();

  const { wallet } = useWalletConnector();

  const {
    sourceToken,
    sourceTokens,
    onSourceTokenChange,
    targetToken,
    chainId,
  } = useToken({ defaultValue: defaultToken });

  const token = useMemo<API.Chain>(() => {
    const _token = {
      ...sourceToken!,
      precision: sourceToken?.decimals ?? 6,
    };
    if (
      _token.token === "ETH" &&
      (!_token.address || _token.address === nativeTokenAddress)
    ) {
      _token.address = nativeETHAddress;
    }
    return _token;
  }, [sourceToken]);

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
    1,
  );

  const { maxAmount, convert } = useConvert({ token: token.token });

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

  const [postQuote, { data: quoteData, isMutating: isQuoteLoading }] =
    useOdosQuote();

  useEffect(() => {
    if (quantity && chainId && token.address && targetToken?.address) {
      postQuote({
        chainId: chainId,
        inputTokens: [
          {
            amount: normalizeAmount(quantity, token.decimals),
            tokenAddress: token.address,
          },
        ],
        outputTokens: [
          {
            proportion: 1,
            tokenAddress: targetToken.address,
          },
        ],
      });
    }
  }, [quantity, token, targetToken, chainId, postQuote]);

  const memoizedOutAmounts = useMemo<string>(() => {
    if (!quoteData || isQuoteLoading) {
      return "-";
    }
    return quoteData?.outAmounts[0];
  }, [quoteData, isQuoteLoading]);

  const memoizedConvertRate = useMemo(() => {
    if (!quoteData || isQuoteLoading) {
      return "-";
    }
    const rate = new Decimal(
      unnormalizeAmount(quoteData.outAmounts[0], targetToken?.decimals ?? 6),
    )
      .div(unnormalizeAmount(quoteData.inAmounts[0], token.decimals))
      .toString();
    return rate;
  }, [isQuoteLoading, quoteData, targetToken?.decimals, token?.decimals]);

  const memoizedMinimumReceived = useMemo(() => {
    if (!quoteData || isQuoteLoading) {
      return 0;
    }
    return calcMinimumReceived({
      amount: quoteData?.outAmounts[0],
      slippage: Number(slippage),
    });
  }, [quoteData, isQuoteLoading, slippage]);

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
    token: token,
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
    isQuoteLoading,
    currentLTV: currentLtv,
    nextLTV: nextLTV,
  };
};
