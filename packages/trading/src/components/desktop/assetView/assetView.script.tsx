import { useCallback, useMemo } from "react";
import {
  useAccountInstance,
  useEventEmitter,
  useLocalStorage,
  useMediaQuery,
  useSettleSubscription,
  useWalletSubscription,
  useAccount,
  useConfig,
  usePrivateQuery,
  useCollateral,
  useMarginRatio,
  usePositionStream,
} from "@orderly.network/hooks";
import {
  MEDIA_TABLET,
  AccountStatusEnum,
  NetworkId,
  API,
} from "@orderly.network/types";
import { modal, toast } from "@orderly.network/ui";
import { capitalizeString } from "@orderly.network/utils";
import {
  DepositAndWithdrawWithSheetId,
  DepositAndWithdrawWithDialogId,
} from "@orderly.network/ui-transfer";
import { useAppContext, useDataTap } from "@orderly.network/react-app";
import { Decimal } from "@orderly.network/utils";
import { useTranslation } from "@orderly.network/i18n";

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

  const getKeyMemo = useMemo(() => {
    const now = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(now.getDate() - 90);

    const startTime = ninetyDaysAgo.getTime();
    const endTime = now.getTime();

    const searchParams = new URLSearchParams();

    searchParams.set("page", "1");
    searchParams.set("size", "5");
    searchParams.set("side", "DEPOSIT");
    searchParams.set("status", "COMPLETED");
    searchParams.set("startTime", startTime.toString());
    searchParams.set("endTime", endTime.toString());

    return `/v1/asset/history?${searchParams.toString()}`;
  }, []);

  const { data: depositHistoryData } = usePrivateQuery<API.AssetHistory>(
    getKeyMemo,
    {
      formatter: (data) => data,
    }
  );

  return {
    isFirstTimeDeposit:
      !unavailable && totalValue === 0 && depositHistoryData?.meta?.total === 0,
    totalValue,
  };
};

export const useAssetViewScript = () => {
  const { t } = useTranslation();
  const account = useAccountInstance();
  const matches = useMediaQuery(MEDIA_TABLET);
  const { isFirstTimeDeposit, totalValue } = useFirstTimeDeposit();

  const networkId = useConfig("networkId") as NetworkId;
  const { state } = useAccount();
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
        ? // @ts-ignore
          positionsInfo["margin_ratio"](10)
        : marginRatio
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
    async (viewName: "deposit" | "withdraw") => {
      let result;
      if (matches) {
        result = await modal.show(DepositAndWithdrawWithSheetId, {
          activeTab: viewName,
        });
      } else {
        result = await modal.show(DepositAndWithdrawWithDialogId, {
          activeTab: viewName,
        });
      }

      return result;
    },
    [matches]
  );

  const onDeposit = useCallback(async () => {
    return openDepositAndWithdraw("deposit");
  }, [matches]);

  const ee = useEventEmitter();

  const onWithdraw = useCallback(async () => {
    return openDepositAndWithdraw("withdraw");
  }, [matches]);

  const onSettle = useCallback(async () => {
    return account
      .settle()
      .catch((e) => {
        if (e.code === -1104) {
          toast.error(t("trading.settlement.error"));
          return Promise.reject(e);
        }
        if (
          e.message.indexOf(
            "Signing off chain messages with Ledger is not yet supported"
          ) !== -1
        ) {
          ee.emit("wallet:sign-message-with-ledger-error", {
            message: e.message,
            userAddress: account.address,
          });
        }
      })
      .then((res) => {
        toast.success(t("trading.settlement.requested"));
        return Promise.resolve(res);
      });
  }, [account, t]);

  const [visible, setVisible] = useLocalStorage<boolean>(
    "orderly_assets_visible",
    true
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
        let msg = `${capitalizeString(side)} completed`;
        toast.success(msg);
      } else if (transStatus === "FAILED") {
        let msg = `${capitalizeString(side)} failed`;
        toast.error(msg);
      }

      ee.emit("wallet:changed", data);
    },
  });

  useSettleSubscription({
    onMessage: (data: any) => {
      const { status } = data;

      switch (status) {
        case "COMPLETED":
          toast.success(t("trading.settlement.completed"));
          break;
        case "FAILED":
          toast.error(t("trading.settlement.failed"));
          break;
        default:
          break;
      }
    },
  });

  const _freeCollateral = useDataTap(freeCollateral) ?? undefined;
  const _marginRatioVal = useDataTap(marginRatioVal) ?? undefined;
  const _mmr = useDataTap(mmr) ?? undefined;
  const _totalValue = useDataTap(totalValue) ?? undefined;

  return {
    onDeposit,
    onWithdraw,
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
  };
};

export type AssetViewState = ReturnType<typeof useAssetViewScript>;
