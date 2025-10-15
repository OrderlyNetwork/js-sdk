import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useAssetsHistory,
  useChains,
  useConfig,
  useEventEmitter,
  useLocalStorage,
  useMemoizedFn,
  useQuery,
  useWalletConnector,
  useWalletTopic,
  useWithdraw,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import {
  API,
  AssetHistorySideEnum,
  AssetHistoryStatusEnum,
  NetworkId,
} from "@orderly.network/types";
import { toast } from "@orderly.network/ui";
import {
  Decimal,
  int2hex,
  praseChainIdToNumber,
  toNonExponential,
} from "@orderly.network/utils";
import { InputStatus, WithdrawTo } from "../../types";
import { CurrentChain } from "../depositForm/hooks";
import { useSettlePnl } from "../unsettlePnlInfo/useSettlePnl";
import { useWithdrawAccountId } from "./hooks/useWithdrawAccountId";
import { useWithdrawFee } from "./hooks/useWithdrawFee";
import { useWithdrawLTV } from "./hooks/useWithdrawLTV";
import { useWithdrawToken } from "./hooks/useWithdrawToken";

export type WithdrawFormScriptReturn = ReturnType<typeof useWithdrawFormScript>;

const markPrice = 1;

export type WithdrawFormScriptOptions = {
  close?: () => void;
};

export const useWithdrawFormScript = (options: WithdrawFormScriptOptions) => {
  const { t } = useTranslation();
  const [crossChainTrans, setCrossChainTrans] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [assetHistory] = useAssetsHistory(
    {
      page: 1,
      pageSize: 1,
      side: AssetHistorySideEnum.WITHDRAW,
      status: AssetHistoryStatusEnum.PENDING_REBALANCE,
    },
    // update when withdraw status changed
    {
      shouldUpdateOnWalletChanged: (data) =>
        data.side === AssetHistorySideEnum.WITHDRAW,
    },
  );

  const config = useConfig();

  const brokerName = config.get("brokerName");
  const networkId = config.get("networkId") as NetworkId;

  const ee = useEventEmitter();

  const [quantity, setQuantity] = useState<string>("");
  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();

  const [withdrawTo, setWithdrawTo] = useState<WithdrawTo>(WithdrawTo.Wallet);

  const { wrongNetwork } = useAppContext();
  const { account } = useAccount();

  const [chains, { findByChainId }] = useChains(networkId, {
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

  const { sourceToken, onSourceTokenChange, sourceTokens } = useWithdrawToken({
    currentChain,
    withdrawTo,
  });

  const tokenChains = useMemo(() => {
    return chains
      .filter((chain) =>
        chain.token_infos?.some(
          (token) => token.symbol === sourceToken?.symbol,
        ),
      )
      .map((chain) => chain.network_infos);
  }, [chains, networkId, sourceToken]);

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

  const { withdraw, maxAmount, unsettledPnL } = useWithdraw({
    token: sourceToken?.symbol,
    decimals: sourceToken?.token_decimal,
  });

  const withdrawAccountIdState = useWithdrawAccountId({
    token: sourceToken?.symbol!,
    decimals: sourceToken?.token_decimal!,
    quantity,
    setQuantity,
    close: options.close,
    setLoading,
  });

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
      (item) =>
        Number.parseInt(item.chain_id) === currentChain?.id &&
        item.token === sourceToken?.symbol,
    );
    if (vaultBalance) {
      return vaultBalance.balance;
    }
    return null;
  }, [chains, currentChain, vaultBalanceList, sourceToken?.symbol]);

  const qtyGreaterThanMaxAmount = useMemo<boolean>(() => {
    if (!quantity || Number.isNaN(quantity)) {
      return false;
    }
    if (!maxAmount || Number.isNaN(maxAmount)) {
      return true;
    }
    return new Decimal(quantity).gt(maxAmount);
  }, [quantity, maxAmount]);

  const qtyGreaterThanVault = useMemo<boolean>(() => {
    if (!quantity || Number.isNaN(quantity)) {
      return false;
    }
    if (!chainVaultBalance || Number.isNaN(chainVaultBalance)) {
      return true;
    }
    return new Decimal(quantity).gt(chainVaultBalance);
  }, [quantity, chainVaultBalance]);

  const crossChainWithdraw = useMemo(() => {
    if (chainVaultBalance !== null) {
      const qtyNum = Number.parseFloat(quantity);
      const value = qtyNum > chainVaultBalance && qtyNum <= maxAmount;
      return value;
    }
    return false;
  }, [quantity, maxAmount, chainVaultBalance]);

  const onWithdraw = async () => {
    if (loading) {
      return;
    }
    if (inputStatus !== "default") {
      return;
    }

    setLoading(true);
    return withdraw({
      amount: quantity,
      token: sourceToken?.symbol!,
      chainId: currentChain?.id!,
      allowCrossChainWithdraw: crossChainWithdraw,
    })
      .then((res) => {
        toast.success(t("transfer.withdraw.requested"));
        ee.emit("withdraw:requested");
        options.close?.();
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
    crossChainWithdraw,
    currentChain,
    token: sourceToken?.symbol!,
    withdrawTo,
  });

  const minAmountWarningMessage = useMemo(() => {
    const minAmount = new Decimal(
      sourceToken?.minimum_withdraw_amount ?? 0,
    ).add(fee);

    if (quantity && new Decimal(quantity).lt(minAmount)) {
      return t("transfer.withdraw.minAmount.error", {
        minAmount: toNonExponential(minAmount.toNumber()),
        currency: sourceToken?.symbol,
      });
    }
  }, [quantity, sourceToken?.minimum_withdraw_amount, fee, t]);

  const showQty = useMemo(() => {
    if (!quantity) {
      return "";
    }

    const value = new Decimal(quantity).sub(fee ?? 0);
    if (value.isNegative()) {
      return "";
    }
    return toNonExponential(value.toNumber());
  }, [fee, quantity]);

  useEffect(() => {
    if (!quantity) {
      setInputStatus("default");
      setHintMessage("");
      return;
    }
    const qty = new Decimal(quantity ?? 0);
    if (unsettledPnL < 0) {
      if (qty.gt(maxAmount)) {
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
    (withdrawTo === WithdrawTo.Account &&
      !withdrawAccountIdState.toAccountId) ||
    qtyGreaterThanMaxAmount ||
    qtyGreaterThanVault ||
    !!minAmountWarningMessage;

  useEffect(() => {
    setCrossChainTrans(!!assetHistory?.length);
  }, [assetHistory?.length]);

  // it need to use useMemoizedFn wrap ,otherwise crossChainTrans and assetHistory will be first render data
  const handleWalletTopic = useMemoizedFn((data: any) => {
    if (!crossChainTrans) {
      return;
    }
    const txId = assetHistory?.[0]?.tx_id;
    const { trxId, transStatus } = data;
    if (trxId === txId && transStatus === "COMPLETED") {
      setCrossChainTrans(false);
    }
  });

  useWalletTopic({
    onMessage: handleWalletTopic,
  });

  const { hasPositions, onSettlePnl } = useSettlePnl();

  const { currentLTV, nextLTV, ltvWarningMessage } = useWithdrawLTV({
    token: sourceToken?.symbol!,
    quantity,
  });

  const warningMessage = ltvWarningMessage || minAmountWarningMessage;

  return {
    walletName,
    address,
    quantity,
    onQuantityChange,
    sourceToken,
    onSourceTokenChange,
    sourceTokens,
    inputStatus,
    hintMessage,
    amount,
    balanceRevalidating: false,
    maxQuantity: maxAmount,
    disabled,
    loading,
    unsettledPnL,
    wrongNetwork,
    settingChain,
    tokenChains,
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
    qtyGreaterThanMaxAmount: qtyGreaterThanMaxAmount,
    qtyGreaterThanVault: qtyGreaterThanVault,
    vaultBalanceList: vaultBalanceList?.filter(
      (item) => Number.parseInt(item.chain_id) === currentChain?.id,
    ),
    ...withdrawAccountIdState,
    withdrawTo,
    setWithdrawTo,
    currentLTV,
    nextLTV,
    warningMessage,
  };
};
