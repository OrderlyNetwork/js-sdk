import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useCollateral,
  useLeverage,
  useLocalStorage,
  usePositionStream,
  useWalletConnector,
} from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { modal } from "@orderly.network/ui";
import { LeverageWidgetId } from "@orderly.network/ui-leverage";
import { DepositAndWithdrawWithDialogId } from "@orderly.network/ui-transfer";
import { useAppContext } from "@orderly.network/react-app";

export const useAssetScript = () => {
  const { connect, namespace } = useWalletConnector();
  const { state } = useAccount();
  const { totalValue, freeCollateral } = useCollateral();
  const { wrongNetwork, disabledConnect } = useAppContext();
  const [data] = usePositionStream();
  const [currentLeverage] = useLeverage();
  const [visible, setVisible] = useLocalStorage("orderly_assets_visible", true);

  const canTrade = useMemo(() => {
    return (
      !wrongNetwork &&
      !disabledConnect &&
      (state.status === AccountStatusEnum.EnableTrading ||
        state.status === AccountStatusEnum.EnableTradingWithoutConnected)
    );
  }, [state.status, wrongNetwork, disabledConnect]);

  const onLeverageEdit = () => {
    modal.show(LeverageWidgetId);
  };

  const onDeposit = () => {
    modal.show(DepositAndWithdrawWithDialogId, { activeTab: "deposit" });
  };

  const onWithdraw = () => {
    modal.show(DepositAndWithdrawWithDialogId, { activeTab: "withdraw" });
  };

  return {
    canTrade,
    connect,
    portfolioValue: totalValue,
    freeCollateral,
    unrealPnL: data.aggregated.total_unreal_pnl,
    unrealROI: data.totalUnrealizedROI,
    currentLeverage,
    onLeverageEdit,
    visible,
    wrongNetwork,
    toggleVisible: () => setVisible(!visible),
    onDeposit,
    onWithdraw,
    namespace,
  } as const;
};

export type UseAssetScriptReturn = ReturnType<typeof useAssetScript>;
