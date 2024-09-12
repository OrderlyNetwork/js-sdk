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
} from "@orderly.network/hooks";
import {
  MEDIA_TABLET,
  AccountStatusEnum,
  NetworkId,
  API,
} from "@orderly.network/types";
import { modal, toast } from "@orderly.network/ui";
import { capitalizeString } from "@orderly.network/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DepositAndWithdrawWithSheetId,
  DepositAndWithdrawWithDialogId,
} from "@orderly.network/ui-transfer";
import { useAppContext } from "@orderly.network/react-app";
import { Decimal } from "@orderly.network/utils";

interface StatusInfo {
  title: string;
  description: string;
  titleColor?: any;
}

const useFirstTimeDeposit = () => {
  const { state } = useAccount();
  const { wrongNetwork } = useAppContext();
  const { totalValue } = useCollateral({
    dp: 2,
  });
  const unavailable =
    wrongNetwork || state.status < AccountStatusEnum.EnableTrading;
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

export const useCurrentStatusText = (): StatusInfo => {
  const { state } = useAccount();
  const { wrongNetwork } = useAppContext();

  const currentStatus = useMemo(() => {
    if (wrongNetwork) {
      return {
        title: "Wrong Network",
        description: "Please switch to a supported network to continue.",
        titleColor: "warning",
      };
    }

    switch (state.status) {
      case AccountStatusEnum.NotConnected:
        return {
          title: "Connect wallet",
          description: "Please connect your wallet before starting to trade.",
        };
      case AccountStatusEnum.NotSignedIn:
        return {
          title: "Sign in",
          description: "Please sign in before starting to trade.",
          titleColor: "primaryLight",
        };
      case AccountStatusEnum.DisabledTrading:
        return {
          title: "Enable trading",
          description: "Enable trading before starting to trade.",
          titleColor: "primaryLight",
        };
      default:
        return {
          title: "",
          description: "",
        };
    }
  }, [state.status, wrongNetwork]);

  return currentStatus;
};

export const useAssetViewScript = () => {
  const account = useAccountInstance();
  const matches = useMediaQuery(MEDIA_TABLET);
  const currentStatus = useCurrentStatusText();
  const { isFirstTimeDeposit, totalValue } = useFirstTimeDeposit();
  const { title, description } = currentStatus;
  const titleColor = currentStatus.titleColor ?? "";
  const networkId = useConfig("networkId") as NetworkId;
  const { state } = useAccount();
  const { freeCollateral } = useCollateral({
    dp: 2,
  });
  const { marginRatio, mmr } = useMarginRatio();
  const isConnected = state.status >= AccountStatusEnum.Connected;
  const marginRatioVal = marginRatio === 0 ? 10 : Math.min(marginRatio, 10);

  const renderMMR = useMemo(() => {
    if (!mmr) {
      return "-";
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
          toast.error(
            "Settlement is only allowed once every 10 minutes. Please try again later."
          );
          return Promise.reject(e);
        }
      })
      .then((res) => {
        toast.success("Settlement requested");
        return Promise.resolve(res);
      });
  }, [account]);

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
          toast.success("Settlement completed");
          break;
        case "FAILED":
          toast.error("Settlement failed");
          break;
        default:
          break;
      }
    },
  });

  return {
    onDeposit,
    onWithdraw,
    onSettle,
    visible,
    toggleVisible,
    title,
    titleColor,
    description,
    networkId,
    isFirstTimeDeposit,
    totalValue,
    status: state.status,
    freeCollateral,
    marginRatioVal,
    renderMMR,
    isConnected,
  };
};

export type AssetViewState = ReturnType<typeof useAssetViewScript>;
