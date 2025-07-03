/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  OrderlyContext,
  useAccount,
  useChains,
  useConfig,
  useEventEmitter,
  useHoldingStream,
  useLocalStorage,
  useOdosQuote,
  useQuery,
  useTransfer,
  useWalletConnector,
  useWalletSubscription,
  useWithdraw,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import { API, NetworkId } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";
import {
  Decimal,
  praseChainIdToNumber,
  removeTrailingZeros,
} from "@orderly.network/utils";
import { InputStatus, WithdrawTo } from "../../types";
import { checkIsAccountId, getTransferErrorMessage } from "../../utils";
import { CurrentChain } from "../depositForm/hooks";
import { useSettlePnl } from "../unsettlePnlInfo/useSettlePnl";
import { useToken } from "./hooks/useToken";

export type ConvertFormScriptReturn = ReturnType<typeof useConvertFormScript>;

const ORDERLY_DEPOSIT_SLIPPAGE_KEY = "ORDERLY_DEPOSIT_SLIPPAGE";

const markPrice = 1;

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

  const ee = useEventEmitter();

  const [quantity, setQuantity] = useState<string>("");
  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();

  const { wrongNetwork } = useAppContext();
  const { account } = useAccount();

  const [allChains, { findByChainId }] = useChains(networkId, {
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

  const [linkDeviceStorage] = useLocalStorage("orderly_link_device", {});

  const { connectedChain, wallet, settingChain } = useWalletConnector();

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
    return {
      ...sourceToken!,
      // withdraw display precision is 6
      precision: sourceToken?.precision ?? 6,
    };
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

  const amount = useMemo(() => {
    return new Decimal(quantity || 0).mul(markPrice).toNumber();
  }, [quantity, markPrice]);

  const internalWithdrawState = useInternalWithdraw({
    symbol: token.symbol,
    quantity,
    setQuantity,
    close: options.onClose,
    setLoading,
  });

  const { withdrawTo, toAccountId } = internalWithdrawState;

  const [slippage, setSlippage] = useLocalStorage(
    ORDERLY_DEPOSIT_SLIPPAGE_KEY,
    "1",
    {
      parseJSON: (value: string | null) => {
        return !value || value === '""' ? "1" : JSON.parse(value);
      },
    },
  );

  const chains = useMemo(() => {
    if (networkId === "mainnet") {
      return allChains.filter((item) => item.bridgeless);
    }

    return allChains;
  }, [allChains, networkId]);

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

  const minAmount = useMemo(() => {
    // @ts-ignore;
    return chains.minimum_withdraw_amount ?? 1;
  }, [chains]);

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
        toast.success(t("transfer.withdraw.requested"));
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

  const showQty = useMemo(() => {
    if (!quantity) {
      return "";
    }

    const value = new Decimal(quantity).sub(fee ?? 0);
    if (value.isNegative()) {
      return "";
    }
    return value.toNumber();
  }, [fee, quantity]);

  const { data: holdingData = [] } = useHoldingStream();

  const [postQuote, { data: quoteData }] = useOdosQuote();

  useEffect(() => {
    if (currentChain?.id && token.address && targetToken?.address) {
      postQuote({
        chainId: currentChain.id,
        inputTokens: [{ amount: quantity, tokenAddress: token.address }],
        outputTokens: [{ proportion: 1, tokenAddress: targetToken.address }],
      });
    }
  }, [quantity, currentChain?.id, token, targetToken]);

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
    amount,
    balanceRevalidating: false,
    maxQuantity: maxQuantity,
    disabled,
    loading,
    wrongNetwork,
    onConvert,
    fee,
    crossChainTrans,
    showQty,
    networkId,
    checkIsBridgeless,
    hasPositions,
    onSettlePnl,
    brokerName,
    slippage,
    setSlippage,
    ...internalWithdrawState,
  };
};

type InternalWithdrawOptions = {
  symbol: string;
  quantity: string;
  setQuantity: (quantity: string) => void;
  close?: () => void;
  setLoading: (loading: boolean) => void;
};

function useInternalWithdraw(options: InternalWithdrawOptions) {
  const { symbol, quantity, setQuantity, close, setLoading } = options;
  const { t } = useTranslation();
  const [withdrawTo, setWithdrawTo] = useState<WithdrawTo>(WithdrawTo.Account);
  const [toAccountId, setToAccountId] = useState<string>("");
  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();

  const { transfer, submitting } = useTransfer();

  const onTransfer = useCallback(() => {
    const num = Number(quantity);

    if (Number.isNaN(num) || num <= 0) {
      toast.error(t("transfer.quantity.invalid"));
      return;
    }

    if (submitting || !toAccountId) {
      return;
    }
    setLoading(true);

    transfer(symbol, {
      account_id: toAccountId,
      amount: new Decimal(quantity).toNumber(),
    })
      .then(() => {
        toast.success(t("transfer.internalTransfer.success"));
        setQuantity("");
        close?.();
      })
      .catch((err) => {
        const errorMsg = getTransferErrorMessage(err.code);
        toast.error(errorMsg);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [t, quantity, symbol, submitting, toAccountId, transfer]);

  useEffect(() => {
    if (!toAccountId) {
      setInputStatus("default");
      setHintMessage("");
      return;
    }

    if (checkIsAccountId(toAccountId)) {
      setInputStatus("default");
      setHintMessage("");
    } else {
      setInputStatus("error");
      setHintMessage(t("transfer.withdraw.accountId.invalid"));
    }
  }, [toAccountId]);

  return {
    withdrawTo,
    setWithdrawTo,
    toAccountId,
    setToAccountId,
    onTransfer,
    internalWithdrawSubmitting: submitting,
    toAccountIdInputStatus: inputStatus,
    toAccountIdHintMessage: hintMessage,
  };
}

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
