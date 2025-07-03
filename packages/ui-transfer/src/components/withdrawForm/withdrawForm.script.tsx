import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  OrderlyContext,
  useAccount,
  useChains,
  useConfig,
  useEventEmitter,
  useLocalStorage,
  usePrivateQuery,
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
import { Decimal, int2hex, praseChainIdToNumber } from "@orderly.network/utils";
import { InputStatus, WithdrawTo } from "../../types";
import { checkIsAccountId, getTransferErrorMessage } from "../../utils";
import { CurrentChain, useToken_v2 } from "../depositForm/hooks";
import { useSettlePnl } from "../unsettlePnlInfo/useSettlePnl";

export type WithdrawFormScriptReturn = ReturnType<typeof useWithdrawFormScript>;

const markPrice = 1;

type WithdrawFormScriptOptions = {
  onClose: (() => void) | undefined;
};

export const useWithdrawFormScript = (options: WithdrawFormScriptOptions) => {
  const { t } = useTranslation();
  const [crossChainTrans, setCrossChainTrans] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { data: assetHistory } = usePrivateQuery<any[]>("/v1/asset/history", {
    revalidateOnMount: true,
  });
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

  const { data: vaultBalanceList } = useQuery<API.VaultBalance[]>(
    `/v1/public/vault_balance`,
    {
      revalidateOnMount: true,
      errorRetryCount: 3,
    },
  );

  const {
    connectedChain,
    wallet,
    setChain: switchChain,
    settingChain,
  } = useWalletConnector();

  const currentChain = useMemo(() => {
    // if (!connectedChain) return null;

    const chainId = connectedChain
      ? praseChainIdToNumber(connectedChain.id)
      : Number.parseInt(linkDeviceStorage?.chainId);

    if (!chainId) return null;

    const chain = findByChainId(chainId);

    return {
      ...connectedChain,
      id: chainId,
      info: chain!,
    } as CurrentChain;
  }, [findByChainId, connectedChain, linkDeviceStorage]);

  // const [token, setToken] = useState<API.TokenInfo>({
  //   symbol: "USDC",
  //   decimals: 6,
  //   address: "",
  //   display_name: "",
  //   precision: 6,
  // });
  const { sourceToken, onSourceTokenChange, sourceTokens } = useToken_v2({
    currentChain,
  });

  const token = useMemo<API.TokenInfo>(() => {
    return {
      ...sourceToken!,
      // withdraw display precision is 6
      precision: sourceToken?.precision ?? sourceToken?.decimals ?? 6,
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

  const {
    withdraw,
    isLoading,
    maxAmount,
    maxOthersAmount,
    availableBalance,
    availableWithdraw,
    unsettledPnL,
  } = useWithdraw({
    decimals: token?.decimals,
    symbol: token?.symbol,
  });

  const internalWithdrawState = useInternalWithdraw({
    symbol: token.symbol,
    quantity,
    setQuantity,
    close: options.onClose,
    setLoading,
  });

  const { withdrawTo, toAccountId } = internalWithdrawState;

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

  const cleanData = () => {
    setQuantity("");
  };

  const onChainChange = useCallback(
    async (chain: API.NetworkInfos) => {
      const chainInfo = findByChainId(chain.chain_id);

      if (
        !chainInfo ||
        chainInfo.network_infos?.chain_id === currentChain?.id
      ) {
        return Promise.resolve();
      }

      return switchChain?.({
        chainId: int2hex(Number(chainInfo.network_infos?.chain_id)),
      })
        .then((switched) => {
          if (switched) {
            toast.success(t("connector.networkSwitched"));
            // clean input value
            cleanData();
          } else {
            toast.error(t("connector.switchChain.failed"));
          }
        })
        .catch((error) => {
          toast.error(`${t("connector.switchChain.failed")}: ${error.message}`);
        });
    },
    [currentChain, switchChain, findByChainId, t],
  );

  const chainVaultBalance = useMemo(() => {
    if (!Array.isArray(vaultBalanceList) || !currentChain) {
      return null;
    }
    // chain.id
    const vaultBalance = vaultBalanceList.find(
      (item) => Number.parseInt(item.chain_id) === currentChain?.id,
    );
    if (vaultBalance) {
      return vaultBalance.balance;
    }
    return null;
  }, [chains, currentChain, vaultBalanceList]);

  const crossChainWithdraw = useMemo(() => {
    if (chainVaultBalance !== null) {
      const qtyNum = Number.parseFloat(quantity);
      const value = qtyNum > chainVaultBalance && qtyNum <= maxAmount;
      return value;
    }
    return false;
  }, [quantity, maxAmount, chainVaultBalance]);

  const minAmount = useMemo(() => {
    // @ts-ignore;
    return chains.minimum_withdraw_amount ?? 1;
  }, [chains]);

  const onWithdraw = async () => {
    if (loading) {
      return;
    }
    if (inputStatus !== "default") {
      return;
    }
    if (new Decimal(quantity).lt(minAmount)) {
      toast.error(
        t("transfer.withdraw.minAmount.error", {
          minAmount,
        }),
      );
      return;
    }
    setLoading(true);
    return withdraw({
      amount: quantity,
      token: token.symbol,
      // @ts-ignore
      chainId: currentChain?.id,
      allowCrossChainWithdraw: crossChainWithdraw,
    })
      .then((res) => {
        toast.success(t("transfer.withdraw.requested"));
        ee.emit("withdraw:requested");
        options.onClose?.();
        setQuantity("");
      })
      .catch((e) => {
        if (e.message.indexOf("user rejected") !== -1) {
          toast.error(t("transfer.rejectTransaction"));
          return;
        }
        if (
          e.message.indexOf(
            "Signing off chain messages with Ledger is not yet supported",
          ) !== -1
        ) {
          ee.emit("wallet:sign-message-with-ledger-error", {
            message: e.message,
            userAddress: account.address,
          });
          return;
        }

        toast.error(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fee = useWithdrawFee({
    apiBaseUrl,
    crossChainWithdraw,
    currentChain,
    token: token.symbol,
  });

  const showQty = useMemo(() => {
    if (!quantity) {
      return "";
    }
    console.log("-- qty", quantity);
    const value = new Decimal(quantity).sub(fee ?? 0);
    if (value.isNegative()) {
      return "";
    }
    return value.toNumber();
  }, [fee, quantity]);

  const maxQuantity = useMemo(() => {
    const symbol = token?.display_name || token?.symbol;
    if (symbol === "USDC") {
      return maxAmount;
    }
    return maxOthersAmount(token, quantity ? Number(quantity) : 0);
  }, [token, maxAmount, maxOthersAmount, quantity]);

  useEffect(() => {
    if (!quantity) {
      setInputStatus("default");
      setHintMessage("");
      return;
    }
    const qty = new Decimal(quantity ?? 0);
    if (unsettledPnL < 0) {
      if (qty.gt(maxQuantity)) {
        setInputStatus("error");
        setHintMessage(t("transfer.insufficientBalance"));
      } else {
        setInputStatus("default");
        setHintMessage("");
      }
    }
  }, [quantity, maxAmount, unsettledPnL, crossChainTrans]);

  const disabled =
    crossChainTrans ||
    !quantity ||
    Number(quantity) === 0 ||
    ["error", "warning"].includes(inputStatus) ||
    (withdrawTo === WithdrawTo.Account && !toAccountId);

  useEffect(() => {
    // const item = assetHistory?.find((e: any) => e.trans_status === "COMPLETED");
    const item = assetHistory?.find(
      (e: any) => e.trans_status === "pending_rebalance".toUpperCase(),
    );
    if (item) {
      setCrossChainTrans(true);
    } else {
      setCrossChainTrans(false);
    }
  }, [assetHistory]);

  useWalletSubscription({
    onMessage(data: any) {
      if (!crossChainTrans) return;
      console.log("subscribe wallet topic", data);
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
    onSourceTokenChange,
    sourceTokens,
    inputStatus,
    hintMessage,
    amount,
    balanceRevalidating: false,
    maxQuantity: maxQuantity,
    disabled,
    loading,
    unsettledPnL,
    wrongNetwork,
    settingChain,
    chains,
    currentChain,
    onChainChange,
    onWithdraw,
    chainVaultBalance,
    fee,
    crossChainWithdraw,
    crossChainTrans,
    showQty,
    networkId,
    checkIsBridgeless,
    hasPositions,
    onSettlePnl,
    brokerName,
    vaultBalanceList: vaultBalanceList?.filter(
      (item) => Number.parseInt(item.chain_id) === currentChain?.id,
    ),
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
  const [withdrawTo, setWithdrawTo] = useState<WithdrawTo>(WithdrawTo.Wallet);
  const [toAccountId, setToAccountId] = useState<string>("");
  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();

  const { transfer, submitting } = useTransfer();

  const onTransfer = useCallback(() => {
    const num = Number(quantity);

    if (isNaN(num) || num <= 0) {
      toast.error(t("transfer.quantity.invalid"));
      return;
    }

    if (submitting || !toAccountId) return;
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
        console.log("transfer error: ", err, err.code);
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
    if (!currentChain) return 0;

    const tokenChain = tokenChainsRes?.find((item) => item.token === token);

    const item = tokenChain?.chain_details?.find(
      (c: any) => Number.parseInt(c.chain_id) === currentChain!.id,
    );

    if (!item) {
      return 0;
    }

    if (crossChainWithdraw) {
      return (
        // @ts-ignore
        (item.withdrawal_fee || 0) + (item.cross_chain_withdrawal_fee || 0)
      );
    }

    return item.withdrawal_fee || 0;
  }, [tokenChainsRes, token, currentChain, crossChainWithdraw]);

  return fee;
}
