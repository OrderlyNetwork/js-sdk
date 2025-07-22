import { useCallback, useMemo } from "react";
import {
  useAccountInstance,
  useEventEmitter,
  useLocalStorage,
  useSettleSubscription,
  useWalletSubscription,
  useAccount,
  useConfig,
  useCollateral,
  useMarginRatio,
  usePositionStream,
  useComputedLTV,
  useAssetsHistory,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext, useDataTap } from "@orderly.network/react-app";
import {
  AccountStatusEnum,
  NetworkId,
  AssetHistorySideEnum,
  AssetHistoryStatusEnum,
} from "@orderly.network/types";
import { modal, toast } from "@orderly.network/ui";
import {
  DepositAndWithdrawWithDialogId,
  TransferDialogId,
} from "@orderly.network/ui-transfer";
import { capitalizeString } from "@orderly.network/utils";
import { Decimal } from "@orderly.network/utils";

export const useFirstTimeDeposit = () => {
  const { state } = useAccount();
  const { wrongNetwork, disabledConnect } = useAppContext();
  const { totalValue } = useCollateral({
    dp: 2,
  });

  const unavailable =
    wrongNetwork ||
    disabledConnect ||
    (state.status < AccountStatusEnum.EnableTrading &&
      state.status !== AccountStatusEnum.EnableTradingWithoutConnected);

  const { startTime, endTime } = useMemo(() => {
    const d = new Date();
    // must set last second of today, when wallet ws changed, it will get latest data from api
    const today = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      23,
      59,
      59,
    );

    const endTime = today.getTime();
    // 90 days ago timestamp
    const startTime = endTime - 90 * 24 * 60 * 60 * 1000;

    return {
      startTime,
      endTime,
    };
  }, []);

  const [_, { meta }] = useAssetsHistory({
    startTime,
    endTime,
    page: 1,
    pageSize: 5,
    side: AssetHistorySideEnum.DEPOSIT,
    status: AssetHistoryStatusEnum.COMPLETED,
  });

  return {
    isFirstTimeDeposit: !unavailable && totalValue === 0 && meta?.total === 0,
    totalValue,
  };
};

export const useAssetViewScript = () => {
  const { t } = useTranslation();
  const account = useAccountInstance();
  const ee = useEventEmitter();

  const { isFirstTimeDeposit, totalValue } = useFirstTimeDeposit();

  const networkId = useConfig("networkId") as NetworkId;
  const { state, isMainAccount } = useAccount();
  const { freeCollateral } = useCollateral({
    dp: 2,
  });
  const { marginRatio, mmr } = useMarginRatio();
  const isConnected = state.status >= AccountStatusEnum.Connected;
  const [{ aggregated, totalUnrealizedROI }, positionsInfo] =
    usePositionStream();
  const marginRatioVal = useMemo(() => {
    return Math.min(
      10,
      aggregated.notional === 0
        ? positionsInfo["margin_ratio"](10)!
        : marginRatio,
    );
  }, [marginRatio, aggregated]);

  const renderMMR = useMemo(() => {
    if (!mmr) {
      return "";
    }
    const bigMMR = new Decimal(mmr);
    return bigMMR.mul(100).todp(2, 0).toFixed(2);
  }, [mmr]);

  const openDepositAndWithdraw = useCallback(
    (viewName: "deposit" | "withdraw") => {
      // desktop always show dialog
      return modal.show(DepositAndWithdrawWithDialogId, {
        activeTab: viewName,
      });
    },
    [],
  );

  const onDeposit = useCallback(async () => {
    return openDepositAndWithdraw("deposit");
  }, []);

  const onWithdraw = useCallback(async () => {
    return openDepositAndWithdraw("withdraw");
  }, []);

  const onTransfer = useCallback(async () => {
    return modal.show(TransferDialogId);
  }, []);

  const onSettle = useCallback(async () => {
    return account
      .settle()
      .catch((e) => {
        if (e.code === -1104) {
          toast.error(t("settle.settlement.error"));
          return Promise.reject(e);
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
        }
      })
      .then((res) => {
        toast.success(t("settle.settlement.requested"));
        return Promise.resolve(res);
      });
  }, [account, t]);

  const [visible, setVisible] = useLocalStorage<boolean>(
    "orderly_assets_visible",
    true,
  );

  const toggleVisible = useCallback(() => {
    // @ts-ignore
    setVisible((visible: boolean) => {
      return !visible;
    });
  }, [visible]);

  useWalletSubscription({
    onMessage: (data: any) => {
      const { side, transStatus } = data;

      if (transStatus === "COMPLETED") {
        const message = {
          DEPOSIT: t("transfer.deposit.completed"),
          WITHDRAW: t("transfer.withdraw.completed"),
        };
        const msg = `${capitalizeString(side)} completed`;
        toast.success(message[side as keyof typeof message] || msg);
      } else if (transStatus === "FAILED") {
        const message = {
          DEPOSIT: t("transfer.deposit.failed"),
          WITHDRAW: t("transfer.withdraw.failed"),
        };
        const msg = `${capitalizeString(side)} failed`;
        toast.error(message[side as keyof typeof message] || msg);
      }

      ee.emit("wallet:changed", data);
    },
  });

  useSettleSubscription({
    onMessage: (data: any) => {
      const { status } = data;

      switch (status) {
        case "COMPLETED":
          toast.success(t("settle.settlement.completed"));
          break;
        case "FAILED":
          toast.error(t("settle.settlement.failed"));
          break;
        default:
          break;
      }
    },
  });

  const currentLtv = useComputedLTV();
  const _freeCollateral = useDataTap(freeCollateral) ?? undefined;
  const _marginRatioVal = useDataTap(marginRatioVal) ?? undefined;
  const _mmr = useDataTap(mmr) ?? undefined;
  const _totalValue = useDataTap(totalValue) ?? undefined;

  return {
    onDeposit,
    onWithdraw,
    onTransfer,
    onSettle,
    visible,
    toggleVisible,
    networkId,
    isFirstTimeDeposit,
    totalValue: _totalValue,
    status: state.status,
    freeCollateral: _freeCollateral,
    marginRatioVal: _marginRatioVal,
    renderMMR: _mmr,
    isConnected,
    isMainAccount,
    hasSubAccount: !!state.subAccounts?.length,
    currentLtv,
  };
};

export type AssetViewState = ReturnType<typeof useAssetViewScript>;
