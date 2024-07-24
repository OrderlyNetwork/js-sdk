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

export const useAssetScript = () => {
  const { connect, chains } = useWalletConnector();
  const { state } = useAccount();
  const { totalValue, freeCollateral } = useCollateral();
  const [data] = usePositionStream();
  const [currentLeverage] = useLeverage();
  const [visible, setVisible] = useLocalStorage("orderly_assets_visible", true);

  const connected = useMemo(() => {
    return state.status === AccountStatusEnum.EnableTrading;
  }, [state]);

  const onLeverageEdit = () => {
    modal.show(LeverageWidgetId);
  };

  return {
    connected,
    connect,
    portfolioValue: totalValue,
    freeCollateral,
    unrealPnL: data.aggregated.unrealPnL,
    unrealROI: data.totalUnrealizedROI,
    currentLeverage,
    onLeverageEdit,
    visible,
    toggleVisible: () => setVisible(!visible),
  } as const;
};

export type UseAssetScriptReturn = ReturnType<typeof useAssetScript>;
