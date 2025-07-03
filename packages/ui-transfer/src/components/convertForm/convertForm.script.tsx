/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useMemo, useState } from "react";
import {
  OrderlyContext,
  useAccount,
  useChains,
  useConfig,
  useHoldingStream,
  useLocalStorage,
  useOdosQuote,
  useQuery,
  useWalletConnector,
  useWalletSubscription,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { account as accountPerp } from "@orderly.network/perp";
import { useAppContext } from "@orderly.network/react-app";
import { API, NetworkId } from "@orderly.network/types";
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

const { calcMinimumReceived } = accountPerp;

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
      _token.address = "0x0000000000000000000000000000000000000000";
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
    ORDERLY_DEPOSIT_SLIPPAGE_KEY,
    "1",
    {
      parseJSON: (value: string | null) => {
        return !value || value === '""' ? "1" : JSON.parse(value);
      },
    },
  );

  const { configStore } = useContext(OrderlyContext);
  const apiBaseUrl = configStore.get("apiBaseUrl");

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
        slippage: slippage,
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

  const fee = useWithdrawFee({
    apiBaseUrl,
    crossChainWithdraw: false,
    currentChain,
    token: token.symbol,
  });

  const { data: holdingData = [] } = useHoldingStream();

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

  const minimumReceived = useMemo(() => {
    if (!quoteData || isQuoteLoading) {
      return 0;
    }
    return calcMinimumReceived({
      amount: quoteData.outAmounts[0],
      slippage: Number(slippage),
    });
  }, [quoteData, isQuoteLoading, slippage]);

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
    fee,
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
  };
};

export function useWithdrawFee(options: {
  apiBaseUrl: string;
  token: string;
  currentChain?: CurrentChain | null;
  crossChainWithdraw: boolean;
}) {
  const { apiBaseUrl, crossChainWithdraw, currentChain, token } = options;

  const { data: tokenChainsRes } = useQuery<any[]>(
    `${apiBaseUrl}/v1/public/token?t=withdraw`,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // If false, undefined data gets cached against the key.
      revalidateOnMount: true,
      // dont duplicate a request w/ same key for 1hr
      dedupingInterval: 3_600_000,
    },
  );

  const fee = useMemo(() => {
    if (!currentChain) {
      return 0;
    }

    const tokenChain = tokenChainsRes?.find((item) => item.token === token);

    const item = tokenChain?.chain_details?.find(
      (c: any) => Number.parseInt(c.chain_id) === currentChain!.id,
    );

    if (!item) {
      return 0;
    }

    if (crossChainWithdraw) {
      return (
        (item.withdrawal_fee || 0) + (item.cross_chain_withdrawal_fee || 0)
      );
    }

    return item.withdrawal_fee || 0;
  }, [tokenChainsRes, token, currentChain, crossChainWithdraw]);

  return fee;
}
