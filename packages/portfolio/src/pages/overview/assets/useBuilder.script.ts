import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useCollateral,
  useLeverage,
  useLocalStorage,
  usePositionStream,
  useWalletConnector,
} from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { modal, useScreen } from "@orderly.network/ui";
import { LeverageWidgetWithDialogId } from "@orderly.network/ui-leverage";
import {
  DepositAndWithdrawWithDialogId,
  DepositAndWithdrawWithSheetId,
} from "@orderly.network/ui-transfer";

export const useAssetScript = () => {
  const { connect, namespace } = useWalletConnector();
  const { state } = useAccount();
  const { totalValue, freeCollateral } = useCollateral();
  const { wrongNetwork, disabledConnect } = useAppContext();
  const [data] = usePositionStream();
  const [currentLeverage] = useLeverage();
  const [visible, setVisible] = useLocalStorage("orderly_assets_visible", true);
  const { isMobile } = useScreen();
  const handleDomId = isMobile
    ? DepositAndWithdrawWithSheetId
    : DepositAndWithdrawWithDialogId;

  const canTrade = useMemo(() => {
    return (
      !wrongNetwork &&
      !disabledConnect &&
      (state.status === AccountStatusEnum.EnableTrading ||
        state.status === AccountStatusEnum.EnableTradingWithoutConnected)
    );
  }, [state.status, wrongNetwork, disabledConnect]);

  const onLeverageEdit = () => {
    modal.show(LeverageWidgetWithDialogId);
  };

  const onDeposit = () => {
    modal.show(handleDomId, { activeTab: "deposit" });
  };

  const onWithdraw = () => {
    modal.show(handleDomId, { activeTab: "withdraw" });
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
