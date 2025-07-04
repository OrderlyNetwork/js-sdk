/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useAssetconvertEvent,
  useChains,
  useConfig,
  useHoldingStream,
  useIndexPricesStream,
  useLocalStorage,
  useOdosQuote,
  usePositionStream,
  useWalletConnector,
  useWalletSubscription,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { account as accountPerp } from "@orderly.network/perp";
import { useAppContext, useDataTap } from "@orderly.network/react-app";
import { API, nativeETHAddress, NetworkId } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";
import {
  Decimal,
  praseChainIdToNumber,
  removeTrailingZeros,
} from "@orderly.network/utils";
import { InputStatus } from "../../types";
import { CurrentChain } from "../depositForm/hooks";
import { useSettlePnl } from "../unsettlePnlInfo/useSettlePnl";
import { useToken } from "./hooks/useToken";

const { calcMinimumReceived, collateralRatio, LTV } = accountPerp;

export type ConvertFormScriptReturn = ReturnType<typeof useConvertFormScript>;

const ORDERLY_DEPOSIT_SLIPPAGE_KEY = "ORDERLY_DEPOSIT_SLIPPAGE";

interface ConvertFormScriptOptions {
  onClose?: () => void;
}

export const useConvertFormScript = (options: ConvertFormScriptOptions) => {
  const { t } = useTranslation();
  const [crossChainTrans, setCrossChainTrans] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const config = useConfig();

  const brokerName = config.get("brokerName");
  const networkId = config.get("networkId") as NetworkId;

  const [quantity, setQuantity] = useState<string>("");
  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();

  const { wrongNetwork } = useAppContext();
  const { account } = useAccount();

  const [, { findByChainId }] = useChains(networkId, {
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

  const [linkDeviceStorage] = useLocalStorage("orderly_link_device", {});

  const { connectedChain, wallet } = useWalletConnector();

  const currentChain = useMemo(() => {
    // if (!connectedChain) return null;

    const chainId = connectedChain
      ? praseChainIdToNumber(connectedChain.id)
      : Number.parseInt(linkDeviceStorage?.chainId);

    if (!chainId) {
      return null;
    }

    const chain = findByChainId(chainId);

    return {
      ...connectedChain,
      id: chainId,
      info: chain!,
    } as CurrentChain;
  }, [findByChainId, connectedChain, linkDeviceStorage]);

  const { sourceToken, sourceTokens, onSourceTokenChange, targetToken } =
    useToken({ currentChain });

  const token = useMemo<API.TokenInfo>(() => {
    const _token = {
      ...sourceToken!,
      precision: sourceToken?.precision ?? sourceToken?.decimals ?? 6,
    };
    if (!_token.address && _token.symbol === "ETH") {
      _token.address = nativeETHAddress;
    }
    return _token;
  }, [sourceToken]);

  useAssetconvertEvent({
    onMessage: (data: any) => {
      toast.success("successfully");
    },
  });

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
    ORDERLY_DEPOSIT_SLIPPAGE_KEY,
    "1",
    {
      parseJSON: (value: string | null) => {
        return !value || value === '""' ? "1" : JSON.parse(value);
      },
    },
  );

  const checkIsBridgeless = useMemo(() => {
    if (wrongNetwork) {
      return false;
    }
    if (!currentChain) {
      return false;
    }
    if (networkId === "testnet") {
      return true;
    }
    if (!currentChain.info) {
      return false;
    }
    if (
      !currentChain.info.network_infos ||
      !currentChain.info.network_infos.bridgeless
    ) {
      return false;
    }
    return true;
  }, [currentChain, wrongNetwork]);

  const onConvert = async () => {
    if (loading) {
      return;
    }
    if (inputStatus !== "default") {
      return;
    }
    setLoading(true);
    return account.assetsManager
      .convert({
        amount: Number(quantity),
        slippage: new Decimal(slippage).div(100).toNumber(),
        converted_asset: token?.symbol ?? "",
      })
      .then(() => {
        toast.success("convert success");
        options.onClose?.();
        setQuantity("");
      })
      .catch((e: Error) => {
        toast.error(
          e.message.includes("user rejected")
            ? t("transfer.rejectTransaction")
            : e.message,
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const { data: holdingData = [], usdc } = useHoldingStream();

  const [postQuote, { data: quoteData, isMutating: isQuoteLoading }] =
    useOdosQuote();

  const convertRate = useMemo(() => {
    if (!quoteData || isQuoteLoading) {
      return "-";
    }
    const rate = new Decimal(quoteData.outAmounts[0])
      .div(quoteData.inAmounts[0])
      .toNumber();
    return rate;
  }, [quoteData]);

  useEffect(() => {
    if (currentChain?.id && token.address && targetToken?.address) {
      postQuote({
        chainId: currentChain.id,
        inputTokens: [{ amount: quantity, tokenAddress: token.address }],
        outputTokens: [{ proportion: 1, tokenAddress: targetToken.address }],
      });
    }
  }, [quantity, currentChain?.id, token, targetToken]);

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

  const minimumReceived = useMemo(() => {
    if (!quoteData || isQuoteLoading) {
      return 0;
    }
    return calcMinimumReceived({
      amount: quoteData?.outAmounts[0],
      slippage: Number(slippage),
    });
  }, [quoteData, isQuoteLoading, slippage]);

  const getCollateralRatio = useCallback(
    (collateralQty: number) => {
      return collateralRatio({
        baseWeight: targetToken?.base_weight ?? 0,
        discountFactor: targetToken?.discount_factor ?? 0,
        collateralQty: collateralQty,
        indexPrice: indexPrice,
      });
    },
    [targetToken, indexPrice],
  );

  const getLTV = useCallback(
    (collRatio: number) => {
      return LTV({
        usdcBalance: usdcBalance,
        upnl: unrealPnL,
        collateralAssets: sourceTokens.map((item) => {
          const qtyData = holdingData?.find((h) => h.token === item.symbol);
          const indexPrice =
            item.symbol === "USDC" ? 1 : indexPrices[item.symbol];
          return {
            qty: qtyData?.holding ?? 0,
            indexPrice: indexPrice ?? 0,
            weight: collRatio,
          };
        }),
      });
    },
    [holdingData, usdcBalance, unrealPnL, sourceTokens, indexPrices],
  );

  const maxQuantity = useMemo(() => {
    const holding = holdingData.find((item) => item.token === token.symbol);
    return holding ? removeTrailingZeros(holding.holding) : "0";
  }, [holdingData, token.symbol]);

  const disabled =
    !quantity ||
    Number(quantity) === 0 ||
    ["error", "warning"].includes(inputStatus);

  useWalletSubscription({
    onMessage(data: any) {
      if (!crossChainTrans) {
        return;
      }

      const { trxId, transStatus } = data;
      if (trxId === crossChainTrans && transStatus === "COMPLETED") {
        setCrossChainTrans(false);
      }
    },
  });

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
    inputStatus,
    hintMessage,
    balanceRevalidating: false,
    maxQuantity: maxQuantity,
    disabled,
    loading,
    wrongNetwork,
    onConvert,
    crossChainTrans,
    networkId,
    checkIsBridgeless,
    hasPositions,
    onSettlePnl,
    brokerName,
    slippage,
    setSlippage,
    convertRate,
    minimumReceived: minimumReceived,
    isQuoteLoading,
    currentLTV: getLTV(getCollateralRatio(Number(quantity))),
    nextLTV: getLTV(getCollateralRatio(0)),
  };
};
