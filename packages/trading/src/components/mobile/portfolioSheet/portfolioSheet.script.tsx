import {
  useAccount,
  useCollateral,
  useEventEmitter,
  useLeverage,
  useMarginRatio,
  usePositionStream,
} from "@orderly.network/hooks";
import { useTradingLocalStorage } from "../../../provider/useTradingLocalStorage";
import { useCallback, useMemo, useState } from "react";
import { modal, SliderMarks, toast } from "@orderly.network/ui";
import { DepositAndWithdrawWithSheetId } from "@orderly.network/ui-transfer";
import { useTranslation } from "@orderly.network/i18n";

export const usePortfolioSheetScript = () => {
  const { account } = useAccount();
  const assets = useAssets();
  const marginRatio = useMarginRatioAndLeverage();
  const ee = useEventEmitter();
  const { t } = useTranslation();

  const [showSliderTip, setShowSliderTip] = useState(false);

  const onSettlePnL = useCallback(async () => {
    return account
      .settle()
      .catch((e) => {
        if (e.code == -1104) {
          toast.error(t("settle.settlement.error"));
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
          return Promise.reject(e);
        }

        if (e?.code === "ACTION_REJECTED") {
          toast.error(t("connector.userRejected"));
          return Promise.reject(e);
        }
      })
      .then((res) => {
        toast.success(t("settle.settlement.requested"));
        return Promise.resolve(res);
      });
  }, [account, t]);

  const onDeposit = useCallback(() => {
    modal.show(DepositAndWithdrawWithSheetId, {
      activeTab: "deposit",
    });
  }, []);

  const onWithdraw = useCallback(() => {
    modal.show(DepositAndWithdrawWithSheetId, {
      activeTab: "withdraw",
    });
  }, []);

  return {
    ...assets,
    ...marginRatio,
    onSettlePnL,
    onDeposit,
    onWithdraw,
    showSliderTip,
    setShowSliderTip,
  };
};

const useAssets = () => {
  const { hideAssets, setHideAssets } = useTradingLocalStorage();
  const toggleHideAssets = () => {
    setHideAssets(!hideAssets);
  };
  const { totalCollateral, freeCollateral, totalValue, availableBalance } =
    useCollateral({
      dp: 2,
    });
  return {
    hideAssets,
    toggleHideAssets,
    totalCollateral,
    freeCollateral,
    totalValue,
    availableBalance,
  };
};

const useMarginRatioAndLeverage = () => {
  const { t } = useTranslation();
  const [{ aggregated, totalUnrealizedROI }, positionsInfo] =
    usePositionStream();
  const { marginRatio, currentLeverage, mmr } = useMarginRatio();

  const marginRatioVal = useMemo(() => {
    return Math.min(
      10,
      aggregated.notional === 0
        ? // @ts-ignore
          positionsInfo["margin_ratio"](10)
        : marginRatio
    );
  }, [marginRatio, aggregated]);

  const [curLeverage, { update, config: leverageLevers, isMutating }] =
    useLeverage();

  const marks = useMemo((): SliderMarks => {
    return (
      leverageLevers?.map((e: number) => ({
        label: `${e}x`,
        value: e,
      })) || []
    );
  }, [leverageLevers]);

  const [leverage, setLeverage] = useState(curLeverage ?? 0);

  const maxLeverage = leverageLevers?.reduce(
    (a: number, item: any) => Math.max(a, Number(item), 0),
    0
  );

  const step = 100 / ((marks?.length || 0) - 1);

  // const leverageValue = useMemo(() => {
  //   const index = leverageLevers.findIndex((item: any) => item === leverage);

  //   return index * step;
  // }, [leverageLevers, leverage, step]);

  const onLeverageChange = (leverage: number) => {
    // maxLeverage / 100 * leverage;
    setLeverage(leverage);
    // updateLeverage(leverage);
  };

  const onSave = async (leverage: number) => {
    try {
      update({ leverage }).then(
        (res: any) => {
          toast.success(t("leverage.updated"));
        },
        (err: Error) => {
          toast.error(err.message);
        }
      );
    } catch (e) {}
  };

  const onValueCommit = useCallback((value: number[]) => {
    onSave(value[0]);
  }, []);

  return {
    aggregated,
    totalUnrealizedROI,
    positionsInfo,
    marginRatio,
    marginRatioVal,
    mmr,

    currentLeverage,
    step,
    marks,
    onLeverageChange,
    onValueCommit,
    value: leverage,
    maxLeverage,
    onSaveLeverage: onSave,
  };
};

export function getMarginRatioColor(marginRatio: number, mmr: number | null) {
  if (mmr === null) {
    return { isRed: false, isYellow: false, isGreen: true };
  }
  const imr = mmr * 2;

  const high = marginRatio <= imr;
  const mid = marginRatio > imr && marginRatio < 1;
  const low = marginRatio >= 1;
  return { high, mid, low };
}

export type PortfolioSheetState = ReturnType<typeof usePortfolioSheetScript>;
